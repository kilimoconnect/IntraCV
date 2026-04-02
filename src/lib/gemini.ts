import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | undefined;

export function geminiClient(): GoogleGenerativeAI {
  if (!_client) _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return _client;
}
