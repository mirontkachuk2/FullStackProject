import { useEffect, useState, Suspense } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import {
    Box,
    Button,
    HStack,
    Input,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import { addTask, updateTask, deleteTask, reorderTasks, getTasks } from "../../api/tasks";
import { User } from "firebase/auth";

// ✅ Import Drag & Drop from `@dnd-kit`
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Task } from "../../types";

// ✅ Import Banana Icons
import bananaUnchecked from "../../assets/banana.png";
import bananaChecked from "../../assets/banana-3.png";
import bananaTitle from "../../assets/banana-2.png";


function SortableTask({ task, updateTask, handleDeleteTask, handleToggleTaskCompletion }: 
    { task: Task; updateTask: any; handleDeleteTask: any, handleToggleTaskCompletion:any }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };


    return (
        <HStack
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            p={2}
            bg="rgba(255, 255, 255, 0.8)"
            borderRadius="md"
            w="100%"
            borderBottom="1px solid rgba(0, 0, 0, 0.1)"
            justifyContent="space-between"
            cursor="grab"
        >
            <img
                src={task.completed ? bananaChecked : bananaUnchecked}
                alt="Checkbox"
                width="30"
                style={{ cursor: "pointer" }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleToggleTaskCompletion(task.id, !task.completed)}
            />
            <Text
                as={task.completed ? "del" : "span"} flex="1"
            >
                {task.title}
            </Text>
            <Button size="sm" colorScheme="red" 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
                e.stopPropagation(); // ✅ Prevent toggling when clicking delete
                handleDeleteTask(task.id);
            }}>
                ❌
            </Button>
        </HStack>
    );
}

export default function TaskList({ user }: { user: User }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [initializing, setInitializing] = useState(true); // ✅ Track loading state

    // ✅ Fetch Tasks from Backend API
    useEffect(() => {
        async function fetchTasks() {
            try {
                const response = await getTasks();

                if (response?.tasks && Array.isArray(response.tasks)) {
                    console.log("✅ Fetched tasks:", response.tasks);
                    setTasks(response.tasks.sort((a, b) => a.position - b.position));
                } else {
                    console.error("🔥 No tasks found in response:", response);
                    setTasks([]);
                }
            } catch (error) {
                console.error("🔥 Error in fetchTasks:", error);
                setTasks([]);
            } finally {
                setInitializing(false); // ✅ Stop loading state after fetching tasks
            }
        }

        if (user) fetchTasks();
    }, [user]);

    // ✅ Prevent UI rendering until tasks are fetched
    if (initializing) return null;

    async function handleAddTask() {
        if (!newTask.trim()) return;
    
        const newPosition = tasks.length > 0 ? Math.max(...tasks.map(t => t.position)) + 1 : 0;
    
        try {
            const response = await addTask(newTask, newPosition);
            
            // ✅ Firestore now generates the ID, so we use the returned task ID
            const newTaskObj = { id: response.id, title: newTask, completed: false, position: newPosition };
            setTasks([...tasks, newTaskObj]); // ✅ UI updates immediately with correct ID
    
        } catch (error) {
            console.error("🔥 Error adding task:", error);
        }
    
        setNewTask("");
    }
    

    // ✅ Handle Task Deletion
    async function handleDeleteTask(taskId: string) {
        // ✅ Remove task from UI instantly
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);

        try {
            await deleteTask(taskId);
        } catch (error) {
            console.error("🔥 Error deleting task:", error);
            setTasks([...tasks, tasks.find(t => t.id === taskId)!]); // ❌ Rollback if API call fails
        }
    }

    // ✅ Handle Drag & Drop
    async function handleDragEnd(event: any) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
    
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);
    
        // ✅ Update UI instantly
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);
    
        // ✅ Log to check if IDs match Firestore
        console.log("🔥 Sending reordered tasks:", newTasks.map((task, index) => ({
            id: task.id, // ✅ Ensure this matches Firestore ID
            position: index,
        })));
    
        try {
            await reorderTasks(newTasks.map((task, index) => ({ id: task.id, position: index })));
        } catch (error) {
            console.error("🔥 Error reordering tasks:", error);
            setTasks(tasks); // ❌ Rollback UI if Firestore fails
        }
    }

    
    async function handleToggleTaskCompletion(id: string, completed: boolean) {
        try {
            const updatedTask = await updateTask(id, completed);
            setTasks((prevTasks) => 
                prevTasks.map((task) => 
                    task.id === id ? { ...task, completed: updatedTask.completed } : task
                )
            );
        } catch (error) {
            console.error("🔥 Error toggling task:", error);
        }
    }  
    

    return (
        <Suspense fallback={null}>
        <Box className="task-manager"
        bg="rgba(255, 255, 255, 0.97)"
        >
            {/* ✅ Title with Banana-2.png */}
            <div className="title-container">
                <Text fontSize="2xl" fontWeight="bold">Your Task Manager</Text>
                <img src={bananaTitle} alt="Banana" />
            </div>

            {/* ✅ Input for New Task */}
            <HStack my={4}>
                <Input
                    placeholder="Enter task title..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    flex="1"
                />
                <Button onClick={handleAddTask}>Add</Button>
            </HStack>

            {/* ✅ Drag & Drop Task List */}
            <DndContext 
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement, restrictToVerticalAxis]} // ✅ Restrict movement inside parent
            >
                <SortableContext items={tasks.map((task) => task.id)}>
                    <VStack gap={3} w="100%">
                        {tasks.map((task) => (
                            <SortableTask key={task.id} task={task} updateTask={updateTask} handleDeleteTask={handleDeleteTask} handleToggleTaskCompletion={handleToggleTaskCompletion} />
                        ))}
                    </VStack>
                </SortableContext>
            </DndContext>
        </Box>
        </Suspense>
    );
};