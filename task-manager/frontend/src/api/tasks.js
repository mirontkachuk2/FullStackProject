import axios from "axios";
import { auth } from "../firebase";
// backend API URL
const API_URL = import.meta.env.VITE_USE_FIREBASE_EMULATORS ? "https://api-5bnlb7dwia-uc.a.run.app/tasks" : "http://127.0.0.1:5001/inspired-terra-452805-v2/us-central1/api/tasks";
/**
 * Get the current user's authentication token
 * @returns {Promise<string|null>} The authentication token or null if not authenticated
 */
async function getToken() {
    try {
        return auth.currentUser ? await auth.currentUser.getIdToken() : null;
    }
    catch (error) {
        console.error("Error getting authentication token:", error);
        return null;
    }
}
/**
 * Fetch all tasks for the authenticated user
 * @returns {Promise<Object>} The tasks data
 */
export async function getTasks() {
    try {
        const token = await getToken();
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Add a new task
 *
 * @param {string} title - The title of the task
 * @param {number} position - The position of the task in the list
 * @returns {Promise<Object>} The created task data
 */
export async function addTask(title, position) {
    try {
        const token = await getToken();
        const response = await axios.post(API_URL, { title, position }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error adding task:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Update a task's completion status
 *
 * @param {string} id - The ID of the task to update
 * @param {boolean} completed - The new completion status
 * @returns {Promise<Object>} The updated task data
 */
export async function updateTask(id, completed) {
    try {
        const token = await getToken();
        const response = await axios.patch(`${API_URL}/${id}`, { completed }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.updatedTask;
    }
    catch (error) {
        console.error("Error updating task:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Delete a task
 *
 * @param {string} id - The ID of the task to delete
 * @returns {Promise<Object>} The response data
 */
export async function deleteTask(id) {
    try {
        const token = await getToken();
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error deleting task:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Reorder tasks by updating their positions
 *
 * @param {Array<{id: string, position: number}>} updatedTasks - Array of tasks with new positions
 * @returns {Promise<Object>} The response data
 */
export async function reorderTasks(updatedTasks) {
    const token = await getToken();
    try {
        const response = await axios.patch(`${API_URL}/order`, { tasks: updatedTasks }, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error reordering tasks:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Generate or retrieve an AI image for a task
 *
 * @param {string} taskTitle - The title of the task to generate an image for
 * @returns {Promise<Object>} The image URL data
 */
export async function getTaskImages(taskTitle) {
    try {
        const response = await fetch(`${API_URL}/generateTaskImage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskTitle })
        });
        return await response.json();
    }
    catch (error) {
        console.error("Error fetching task image:", error);
        throw error;
    }
}
