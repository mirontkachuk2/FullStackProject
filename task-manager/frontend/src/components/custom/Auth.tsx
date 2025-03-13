import { useEffect, useState, Suspense } from "react";
import { loginWithGoogle, logout, listenToAuthChanges } from "../../firebase";
import { User } from "firebase/auth";
import { Button, Flex, Text, Spinner, VStack, Box } from "@chakra-ui/react";
import TaskList from "./TaskList";
import TaskVisualiser from "./TaskVisualiser";
import { getTasks } from "../../api/tasks";
import { Task } from "../../types";


export default function Auth() {
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showVisualiser, setShowVisualiser] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToAuthChanges((user) => {
            console.log("Auth state changed:", user);
            setUser(user);
            setInitializing(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function fetchTasks() {
            if (user) {
                setTasksLoading(true);
                try {
                    const response = await getTasks();
                    console.log("🔥 Tasks fetched:", response.tasks);
                    setTasks(response.tasks || []);
                } catch (error) {
                    console.error("🔥 Error fetching tasks:", error);
                } finally {
                    setTasksLoading(false);
                }
            }
        }
        fetchTasks();
    }, [user, showVisualiser]);

    if (initializing) return null;

    return (
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            height="100vh"
            width="100vw"
            p={4}
        >
                {user ? (
                    <>
                        {showVisualiser ? (
                            <>
                                <TaskVisualiser tasks={tasks} />

                                <Button mt={2} size="md" fontWeight="bold" onClick={() => setShowVisualiser(false)}>
                                    Back
                                </Button>
                            </>
                        ) : (
                            <>
                                {!tasksLoading && (
                                    <>
                                        <TaskList user={user} />
                                        <VStack mt={4} width="100%">
                                            <Button 
                                                size="md"
                                                fontWeight="bold"
                                                onClick={() => setShowVisualiser(true)}
                                            >
                                                Visualise
                                            </Button>
                                            <Button
                                                size="md"
                                                fontWeight="bold"
                                                onClick={logout}
                                            >
                                                Logout
                                            </Button>
                                        </VStack>

                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <Button onClick={loginWithGoogle}>
                        Sign in with Google
                    </Button>
                )}
        </Flex>
    );
}
