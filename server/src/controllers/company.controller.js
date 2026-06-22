import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getCompanyPrepData = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const companyName = name.trim();

  const client = getGeminiClient();
  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction: "You are a professional hiring director who knows the recruitment processes of large tech and services companies. Output JSON."
      });

      const prompt = `Generate a recruitment preparation guide for candidate applying to '${companyName}'.
      Provide the response in the following JSON format:
      {
        "companyName": "${companyName}",
        "hiringProcess": ["Step 1", "Step 2", "Step 3"],
        "oaPattern": "A summary of the online assessment pattern",
        "codingQuestions": [
          { "title": "Example Coding Question Title", "difficulty": "Easy|Medium|Hard", "description": "Short description of the challenge" }
        ],
        "technicalQuestions": ["Technical question 1", "Technical question 2"],
        "hrQuestions": ["HR question 1", "HR question 2"]
      }`;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      return res.status(200).json(new ApiResponse(200, data, "Company prep data generated successfully"));
    } catch (err) {
      console.error("Gemini failed generating company data: ", err);
    }
  }

  throw new ApiError(503, "Company preparation generator is currently offline. Please configure your Gemini API Key.");
});
