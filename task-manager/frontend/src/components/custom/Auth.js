import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { loginWithGoogle, logout, listenToAuthChanges } from "../../firebase";
import { Button, Flex, VStack } from "@chakra-ui/react";
import TaskList from "./TaskList";
import TaskVisualiser from "./TaskVisualiser";
import { getTasks } from "../../api/tasks";
export default function Auth() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
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
                }
                catch (error) {
                    console.error("🔥 Error fetching tasks:", error);
                }
                finally {
                    setTasksLoading(false);
                }
            }
        }
        fetchTasks();
    }, [user, showVisualiser]);
    if (initializing)
        return null;
    return (_jsx(Flex, { direction: "column", align: "center", justify: "center", height: "100vh", width: "100vw", p: 4, children: user ? (_jsx(_Fragment, { children: showVisualiser ? (_jsxs(_Fragment, { children: [_jsx(TaskVisualiser, { tasks: tasks }), _jsx(Button, { mt: 2, size: "md", fontWeight: "bold", onClick: () => setShowVisualiser(false), children: "Back" })] })) : (_jsx(_Fragment, { children: !tasksLoading && (_jsxs(_Fragment, { children: [_jsx(TaskList, { user: user }), _jsxs(VStack, { mt: 4, width: "100%", children: [_jsx(Button, { size: "md", fontWeight: "bold", onClick: () => setShowVisualiser(true), children: "Visualise" }), _jsx(Button, { size: "md", fontWeight: "bold", onClick: logout, children: "Logout" })] })] })) })) })) : (_jsx(Button, { onClick: loginWithGoogle, children: "Sign in with Google" })) }));
}
