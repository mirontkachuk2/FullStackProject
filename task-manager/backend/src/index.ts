import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";

import express, { Request, Response } from "express";
import cors from "cors";

import { generateImagePrompt, generateImageFromPrompt } from "./image_gen";
import { authenticate } from "./auth";


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "inspired-terra-452805-v2",
});


const db = getFirestore("(default)");
logger.info("Firestore instance initialized successfully");
const app = express();
// const allowedOrigins = ["https://inspired-terra-452805-v2.web.app"];

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());


/**
 * Get all tasks for authenticated user
 * 
 * @route GET /tasks
 * @auth Required
 */
app.get("/tasks", authenticate, async (req: Request, res: Response) => {
    logger.info("Processing task get request");
    try {
        const userId = req.user?.uid;
        if (!userId) return res.status(403).json({ error: "Unauthorized" });
        
        const snapshot = await db.collection("tasks").where("userId", "==", userId).get();
        
        const tasks = snapshot.docs.map(doc => ({ 
            id: doc.id,
            ...doc.data(), 
            //createdAt: formatFirestoreTimestamp((doc.data().createdAt).toDate())
        }));

        logger.info(`Returned tasks for user: ${userId}`);
        return res.json({ tasks });
    } catch (error) {
        logger.error("Error fetching tasks:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Create a new task
 * 
 * @route POST /tasks
 * @auth Required
 */
app.post("/tasks", authenticate, async (req: Request, res: Response) => {
    logger.info("Processing task post request");
    try {
        const { title } = req.body;
        const userId = req.user?.uid;
        if (!userId) return res.status(403).json({ error: "Unauthorized" });

        const userTasksRef = db.collection("tasks").where("userId", "==", userId);
        const snapshot = await userTasksRef.get();
        const nextPosition = snapshot.size > 0 ? snapshot.size : 0;

        const newTask = {
            title,
            completed: false,
            userId,
            position: nextPosition,
            //createdAt: FieldValue.serverTimestamp(),
        };

        const taskRef = await db.collection("tasks").add(newTask);
        const taskId = taskRef.id;
        await taskRef.update({ id: taskId });
        
        logger.info(`Created new task with ID: ${taskId}`);
        return res.json({ id: taskRef.id, ...newTask });
    } catch (error) {
        logger.error("Error creating task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Delete a task
 * 
 * @route DELETE /tasks/:id
 * @auth Required
 */
app.delete("/tasks/:id", authenticate, async (req: Request, res: Response) => {
    logger.info("Processing task delete request");
    try {
        const { id } = req.params;
        const userId = req.user?.uid;

        const taskRef = db.collection("tasks").doc(id);
        const taskSnapshot = await taskRef.get();

        if (!taskSnapshot.exists) {
            return res.status(404).json({ error: "Task not found" });
        }

        const task = taskSnapshot.data();
        if (task?.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized to delete this task" });
        }

        await taskRef.delete();
        logger.info(`Deleted task with ID: ${id}`);

        return res.json({ success: true });
    } catch (error) {
        logger.error("Error deleting task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Update task order positions
 * 
 * @route PATCH /tasks/order
 * @auth Required
 */
app.patch("/tasks/order", authenticate, async (req: Request, res: Response) => {
    logger.info("Processing task reordering request");
    try {
        const { tasks } = req.body;
        const userId = req.user?.uid;
        if (!userId) return res.status(403).json({ error: "Unauthorized" });

        if (!Array.isArray(tasks) || tasks.some(task => typeof task.position !== "number" || task.position < 0)) {
            logger.error("Invalid task positions:", JSON.stringify(tasks, null, 2));
            return res.status(400).json({ error: "Invalid task positions" });
        }

        const batch = db.batch();
        let updatedCount = 0;
        const notFoundTasks: string[] = [];

        for (const task of tasks) {
            const taskRef = db.collection("tasks").doc(task.id);

            const taskSnapshot = await taskRef.get();
            if (!taskSnapshot.exists) {
                logger.warn(`Task not found: ${task.id}`);
                notFoundTasks.push(task.id);
                continue;
            }

            batch.update(taskRef, { position: task.position });
            updatedCount++;
        }

        await batch.commit();
        logger.info(`Reordered tasks for user: ${userId}`);
        return res.json({
            success: true,
        });
    } catch (error) {
        logger.error("Error in reorder function:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Update a task's completion status
 * 
 * @route PATCH /tasks/:id
 * @auth Required
 */
app.patch("/tasks/:id", authenticate, async (req: Request, res: Response) => {
    logger.info("Updating task request");
    try {
        const { id } = req.params;
        const { completed } = req.body;
        const userId = req.user?.uid;

        const taskRef = db.collection("tasks").doc(id);
        const taskSnapshot = await taskRef.get();

        if (!taskSnapshot.exists) {
            return res.status(404).json({ error: "Task not found" });
        }

        const task = taskSnapshot.data();
        if (task?.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized to update this task" });
        }

        await taskRef.update({ completed });

        // Fetch the updated task after updating
        const updatedTaskSnapshot = await taskRef.get();
        const updatedTask = updatedTaskSnapshot.data();

        logger.info(`Deleted task ${id}`);
        return res.json({ success: true, updatedTask });
    } catch (error) {
        logger.error("Error updating task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Generate an AI image for a task
 * 
 * @route POST /tasks/generateTaskImage
 */
app.post("/tasks/generateTaskImage", async (req: Request, res: Response) => {
    logger.info("Processing image generation request");
    try {
        const { taskTitle } = req.body;
        const userId = req.user?.uid;
        if (!userId) return res.status(403).json({ error: "Unauthorized" });

        const existingImage = await db
            .collection("task_images")
            .where("taskTitle", "==", taskTitle)
            .limit(1)
            .get();

        if (!existingImage.empty) {
            const imageUrl = existingImage.docs[0].data().imageUrl;
            logger.info(`Image already exists for task: ${taskTitle}`);
            return res.json({ imageUrl });
        }
        
        const imagePrompt = await generateImagePrompt(taskTitle);
        const imageUrl = await generateImageFromPrompt(imagePrompt);

        const imageRef = await db.collection("task_images").add({
            taskTitle,
            prompt: imagePrompt,
            imageUrl,
            createdAt: FieldValue.serverTimestamp()
        });

        logger.info(`Image stored in Firestore with ID: ${imageRef.id}`);
        return res.json({ imageUrl });
    } catch (error) {
        logger.error("Error generating task image:", error);
        return res.status(500).json({ error: "Failed to generate AI image" });
    }
});


export const api = onRequest(app);
