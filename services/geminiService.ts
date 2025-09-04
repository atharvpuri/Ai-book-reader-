import { GoogleGenAI } from "@google/genai";
import type { GeminiSettings } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBookContent = async (
  bookContent: string,
  query: string,
  settings: GeminiSettings
): Promise<string> => {
  try {
    const systemInstruction = `You are a world-class literary analyst AI. Your task is to answer questions based *exclusively* on the provided book content. Do not use any external knowledge. If the answer cannot be found within the text, state that clearly. Be concise and precise in your answers.`;

    const prompt = `Here is the book content you must analyze:
--- BOOK CONTENT START ---
${bookContent}
--- BOOK CONTENT END ---

Based on the book content above, please answer the following question:
"${query}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: settings.temperature,
            topP: settings.topP,
            topK: settings.topK,
        }
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("Received an empty response from the AI.");
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(`Error communicating with the AI model. Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
