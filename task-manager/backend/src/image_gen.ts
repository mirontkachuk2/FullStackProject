import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";


dotenv.config({ path: path.resolve(__dirname, "../../.env") });
//dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_URL = process.env.OPENAI_CHAT_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_DALLE_URL = process.env.OPENAI_DALLE_URL || "https://api.openai.com/v1/images/generations";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4-turbo";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";
const OPENAI_IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || "1024x1024";


const promptsPath = path.join(__dirname, "..", "prompts.json");
if (!fs.existsSync(promptsPath)) {
    throw new Error(`Prompts file not found at ${promptsPath}`);
}
const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf-8"));


//banana-styled image prompt using Task Name
export async function generateImagePrompt(taskTitle: string): Promise<string> {
    try {
        const promptTemplate = prompts.image_prompt;
        const userPrompt = promptTemplate.replace("{taskTitle}", taskTitle);

        const response = await axios.post(
            OPENAI_CHAT_URL,
            {
                model: OPENAI_CHAT_MODEL,
                messages: [{ role: "user", content: userPrompt }],
                max_tokens: 100
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
            }
        );

        const generatedPrompt = response.data.choices[0].message.content.trim();
        console.log(`Generated Image Prompt: ${generatedPrompt}`);
        return generatedPrompt;
    } catch (error) {
        console.error("Error generating image prompt:", error);
        throw new Error("Failed to generate image prompt.");
    }
}


//image gen using dalle
export async function generateImageFromPrompt(prompt: string): Promise<string> {
    try {
        const response = await axios.post(
            OPENAI_DALLE_URL,
            {
                model: OPENAI_IMAGE_MODEL,
                prompt,
                n: 1,
                size: OPENAI_IMAGE_SIZE
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
            }
        );

        const imageUrl = response.data.data[0].url;
        return imageUrl;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
}
