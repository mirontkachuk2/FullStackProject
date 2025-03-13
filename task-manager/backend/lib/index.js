"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const image_gen_1 = require("./image_gen");
const auth_1 = require("./auth");
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "inspired-terra-452805-v2",
});
const db = (0, firestore_1.getFirestore)("(default)");
firebase_functions_1.logger.info("Firestore instance initialized successfully");
const app = (0, express_1.default)();
// const allowedOrigins = ["https://inspired-terra-452805-v2.web.app"];
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
app.use(express_1.default.json());
/**
 * Get all tasks for authenticated user
 *
 * @route GET /tasks
 * @auth Required
 */
app.get("/tasks", auth_1.authenticate, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId)
            return res.status(403).json({ error: "Unauthorized" });
        firebase_functions_1.logger.info(`Fetching tasks for user: ${userId}`);
        const snapshot = await db.collection("tasks").where("userId", "==", userId).get();
        firebase_functions_1.logger.info(`Firestore returned ${snapshot.size} tasks`);
        const tasks = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return res.json({ tasks });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error fetching tasks:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * Create a new task
 *
 * @route POST /tasks
 * @auth Required
 */
app.post("/tasks", auth_1.authenticate, async (req, res) => {
    var _a;
    try {
        const { title } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
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
        firebase_functions_1.logger.info(`Created new task with ID: ${taskId}`);
        return res.json(Object.assign({ id: taskRef.id }, newTask));
    }
    catch (error) {
        firebase_functions_1.logger.error("Error creating task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * Delete a task
 *
 * @route DELETE /tasks/:id
 * @auth Required
 */
app.delete("/tasks/:id", auth_1.authenticate, async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const taskRef = db.collection("tasks").doc(id);
        const taskSnapshot = await taskRef.get();
        if (!taskSnapshot.exists) {
            return res.status(404).json({ error: "Task not found" });
        }
        const task = taskSnapshot.data();
        if ((task === null || task === void 0 ? void 0 : task.userId) !== userId) {
            return res.status(403).json({ error: "Unauthorized to delete this task" });
        }
        await taskRef.delete();
        firebase_functions_1.logger.info(`Deleted task with ID: ${id}`);
        return res.json({ success: true });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error deleting task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * Update task order positions
 *
 * @route PATCH /tasks/order
 * @auth Required
 */
app.patch("/tasks/order", auth_1.authenticate, async (req, res) => {
    firebase_functions_1.logger.info("Processing task reordering request");
    try {
        const { tasks } = req.body;
        firebase_functions_1.logger.info(`Received ${(tasks === null || tasks === void 0 ? void 0 : tasks.length) || 0} tasks to reorder`);
        if (!Array.isArray(tasks) || tasks.some(task => typeof task.position !== "number" || task.position < 0)) {
            firebase_functions_1.logger.error("Invalid task positions:", JSON.stringify(tasks, null, 2));
            return res.status(400).json({ error: "Invalid task positions" });
        }
        const batch = db.batch();
        let updatedCount = 0;
        const notFoundTasks = [];
        for (const task of tasks) {
            const taskRef = db.collection("tasks").doc(task.id);
            firebase_functions_1.logger.debug(`Checking task existence: ${task.id}`);
            const taskSnapshot = await taskRef.get();
            if (!taskSnapshot.exists) {
                firebase_functions_1.logger.warn(`Task not found: ${task.id}`);
                notFoundTasks.push(task.id);
                continue;
            }
            firebase_functions_1.logger.debug(`Updating position: ${task.id} -> ${task.position}`);
            batch.update(taskRef, { position: task.position });
            updatedCount++;
        }
        await batch.commit();
        firebase_functions_1.logger.info(`Successfully updated ${updatedCount} tasks`);
        return res.json({
            success: true,
        });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error in reorder function:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * Update a task's completion status
 *
 * @route PATCH /tasks/:id
 * @auth Required
 */
app.patch("/tasks/:id", auth_1.authenticate, async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { completed } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const taskRef = db.collection("tasks").doc(id);
        const taskSnapshot = await taskRef.get();
        if (!taskSnapshot.exists) {
            return res.status(404).json({ error: "Task not found" });
        }
        const task = taskSnapshot.data();
        if ((task === null || task === void 0 ? void 0 : task.userId) !== userId) {
            return res.status(403).json({ error: "Unauthorized to update this task" });
        }
        await taskRef.update({ completed });
        firebase_functions_1.logger.info(`Updated task ${id} completion status to: ${completed}`);
        // Fetch the updated task after updating
        const updatedTaskSnapshot = await taskRef.get();
        const updatedTask = updatedTaskSnapshot.data();
        return res.json({ success: true, updatedTask });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error updating task:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
/**
 * Generate an AI image for a task
 *
 * @route POST /tasks/generateTaskImage
 */
app.post("/tasks/generateTaskImage", async (req, res) => {
    try {
        firebase_functions_1.logger.info("Processing image generation request");
        const { taskTitle } = req.body;
        if (!taskTitle) {
            return res.status(400).json({ error: "Task title is required" });
        }
        const existingImage = await db
            .collection("task_images")
            .where("taskTitle", "==", taskTitle)
            .limit(1)
            .get();
        if (!existingImage.empty) {
            const imageUrl = existingImage.docs[0].data().imageUrl;
            firebase_functions_1.logger.info(`Image already exists for task: ${taskTitle}`);
            return res.json({ imageUrl });
        }
        const imagePrompt = await (0, image_gen_1.generateImagePrompt)(taskTitle);
        const imageUrl = await (0, image_gen_1.generateImageFromPrompt)(imagePrompt);
        const imageRef = await db.collection("task_images").add({
            taskTitle,
            prompt: imagePrompt,
            imageUrl,
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        firebase_functions_1.logger.info(`Image stored in Firestore with ID: ${imageRef.id}`);
        return res.json({ imageUrl });
    }
    catch (error) {
        firebase_functions_1.logger.error("Error generating task image:", error);
        return res.status(500).json({ error: "Failed to generate AI image" });
    }
});
exports.api = (0, https_1.onRequest)(app);
//# sourceMappingURL=index.js.map