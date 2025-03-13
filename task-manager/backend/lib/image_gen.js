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
exports.generateImagePrompt = generateImagePrompt;
exports.generateImageFromPrompt = generateImageFromPrompt;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
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
async function generateImagePrompt(taskTitle) {
    try {
        const promptTemplate = prompts.image_prompt;
        const userPrompt = promptTemplate.replace("{taskTitle}", taskTitle);
        const response = await axios_1.default.post(OPENAI_CHAT_URL, {
            model: OPENAI_CHAT_MODEL,
            messages: [{ role: "user", content: userPrompt }],
            max_tokens: 100
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });
        const generatedPrompt = response.data.choices[0].message.content.trim();
        console.log(`Generated Image Prompt: ${generatedPrompt}`);
        return generatedPrompt;
    }
    catch (error) {
        console.error("Error generating image prompt:", error);
        throw new Error("Failed to generate image prompt.");
    }
}
//image gen using dalle
async function generateImageFromPrompt(prompt) {
    try {
        const response = await axios_1.default.post(OPENAI_DALLE_URL, {
            model: OPENAI_IMAGE_MODEL,
            prompt,
            n: 1,
            size: OPENAI_IMAGE_SIZE
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });
        const imageUrl = response.data.data[0].url;
        return imageUrl;
    }
    catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
}
//# sourceMappingURL=image_gen.js.map