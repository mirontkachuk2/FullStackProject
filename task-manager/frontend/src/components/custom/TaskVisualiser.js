import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Box, Image, SimpleGrid, Text, Flex } from "@chakra-ui/react";
import bananaTitle from "../../assets/banana-2.png"; // 🍌 Jumping banana
import { getTaskImages } from "../../api/tasks";
export default function TaskVisualiser({ tasks }) {
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState({});
    useEffect(() => {
        async function fetchImages() {
            tasks.sort((a, b) => a.position - b.position); // ✅ Sort by position
            tasks.forEach(async (task) => {
                setLoading((prev) => ({ ...prev, [task.id]: true }));
                try {
                    const response = await getTaskImages(task.title);
                    setImages((prev) => ({ ...prev, [task.id]: response.imageUrl }));
                }
                catch (error) {
                    console.error(`🔥 Error fetching image for ${task.title}:`, error);
                }
                finally {
                    setLoading((prev) => ({ ...prev, [task.id]: false }));
                }
            });
        }
        fetchImages();
    }, [tasks]);
    // ✅ Dynamically adjust columns and block height
    const columns = tasks.length > 6 ? 4 : tasks.length > 3 ? 3 : tasks.length === 1 ? 1 : 2;
    const imageSize = tasks.length > 6 ? "180px" : "256px"; // ✅ Adjust image size
    return (_jsx(Flex, { height: "100vh" /* ✅ Full viewport height */, width: "100vw" /* ✅ Full viewport width */, justifyContent: "center" /* ✅ Center horizontally */, alignItems: "center" /* ✅ Center vertically */, children: _jsxs(Box, { className: "task-manager", bg: "rgba(255, 255, 255, 0.97)", p: 6, borderRadius: "lg", boxShadow: "lg", textAlign: "center", width: "90%", maxW: "800px", minH: "70vh" /* ✅ Ensures the box has enough initial height */, height: "auto" /* ✅ Allows expansion when needed */, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", overflow: "visible" /* ✅ Prevents content from being cut off */, children: [_jsx(Text, { fontSize: "2xl", fontWeight: "bold", mb: 4, children: "Task Visualiser" }), _jsx(SimpleGrid, { columns: columns, gap: 4, width: "100%", justifyContent: "center" /* ✅ Centers items properly */, alignItems: "center" /* ✅ Align items within the grid */, autoRows: "1fr" /* ✅ Ensures rows expand evenly */, minChildWidth: "180px", children: tasks.length === 0 ? (_jsx(Text, { fontSize: "lg", children: "No tasks available to visualise." })) : (tasks.map((task) => (_jsxs(Box, { p: 4, borderWidth: 2, borderRadius: "lg", bg: "white", boxShadow: "md", textAlign: "center", className: "image-container", width: tasks.length === 1 ? "50%" : "100%", mx: "auto" /* ✅ Centers when there's only one item */, children: [_jsx(Text, { fontSize: "md", fontWeight: "semibold", children: task.title }), loading[task.id] ? (_jsx(Image, { src: bananaTitle, alt: "Generating...", width: imageSize, height: imageSize, className: "jumping-banana", mx: "auto" })) : (_jsx(Image, { src: images[task.id], alt: task.title, width: imageSize, height: "auto", borderRadius: "md", boxShadow: "sm", mx: "auto" }))] }, task.id)))) })] }) }));
}
