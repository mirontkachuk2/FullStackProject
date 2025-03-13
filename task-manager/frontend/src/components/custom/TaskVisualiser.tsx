import { useEffect, useState } from "react";
import { Box, Image, SimpleGrid, Text, Flex } from "@chakra-ui/react";
import bananaTitle from "../../assets/banana-2.png"; // 🍌 Jumping banana
import { getTaskImages } from "../../api/tasks";
import { Task } from "../../types"; // ✅ Import Task type


export default function TaskVisualiser({ tasks }: { tasks: Task[] }) {
    const [images, setImages] = useState<{ [taskId: string]: string }>({});
    const [loading, setLoading] = useState<{ [taskId: string]: boolean }>({});

    useEffect(() => {
        async function fetchImages() {
            tasks.sort((a, b) => a.position - b.position); // ✅ Sort by position
            tasks.forEach(async (task) => {
                setLoading((prev) => ({ ...prev, [task.id]: true }));

                try {
                    const response = await getTaskImages(task.title);
                    setImages((prev) => ({ ...prev, [task.id]: response.imageUrl }));
                } catch (error) {
                    console.error(`🔥 Error fetching image for ${task.title}:`, error);
                } finally {
                    setLoading((prev) => ({ ...prev, [task.id]: false }));
                }
            });
        }

        fetchImages();
    }, [tasks]);

// ✅ Dynamically adjust columns and block height
const columns = tasks.length > 6 ? 4 : tasks.length > 3 ? 3 : tasks.length === 1 ? 1 : 2;
const imageSize = tasks.length > 6 ? "180px" : "256px"; // ✅ Adjust image size

return (
    <Flex 
        height="100vh" /* ✅ Full viewport height */
        width="100vw" /* ✅ Full viewport width */
        justifyContent="center" /* ✅ Center horizontally */
        alignItems="center" /* ✅ Center vertically */
    >
        <Box 
            className="task-manager"
            bg="rgba(255, 255, 255, 0.97)"
            p={6} 
            borderRadius="lg" 
            boxShadow="lg"
            textAlign="center"
            width="90%" 
            maxW="800px"
            minH="70vh" /* ✅ Ensures the box has enough initial height */
            height="auto" /* ✅ Allows expansion when needed */
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            overflow="visible" /* ✅ Prevents content from being cut off */
        >
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
                Task Visualiser
            </Text>

            <SimpleGrid 
                columns={columns} /* ✅ Adjusts columns based on count */
                gap={4} 
                width="100%"
                justifyContent="center" /* ✅ Centers items properly */
                alignItems="center" /* ✅ Align items within the grid */
                autoRows="1fr" /* ✅ Ensures rows expand evenly */
                minChildWidth="180px"
            >
                {tasks.length === 0 ? (
                    <Text fontSize="lg">No tasks available to visualise.</Text>
                ) : (
                    tasks.map((task) => (
                        <Box 
                            key={task.id} 
                            p={4} 
                            borderWidth={2} 
                            borderRadius="lg" 
                            bg="white"
                            boxShadow="md"
                            textAlign="center"
                            className="image-container"
                            width={tasks.length === 1 ? "50%" : "100%"} /* ✅ Prevents single item from stretching */
                            mx="auto" /* ✅ Centers when there's only one item */
                        >
                            <Text fontSize="md" fontWeight="semibold">{task.title}</Text>
                            {loading[task.id] ? (
                                <Image 
                                    src={bananaTitle} 
                                    alt="Generating..." 
                                    width={imageSize}
                                    height={imageSize}
                                    className="jumping-banana"
                                    mx="auto"
                                />
                            ) : (
                                <Image 
                                    src={images[task.id]} 
                                    alt={task.title} 
                                    width={imageSize}
                                    height="auto" 
                                    borderRadius="md"
                                    boxShadow="sm"
                                    mx="auto"
                                />
                            )}
                        </Box>
                    ))
                )}
            </SimpleGrid>
        </Box>
    </Flex>
)}
