import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geminiService } from "../services/gemini.service.js";
import { logger } from "../utils/logger.js";

export const sendMessageToCoach = asyncHandler(async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    throw new ApiError(400, "Message content is required");
  }

  // Validate history structure or default to empty array
  const formattedHistory = Array.isArray(chatHistory) ? chatHistory : [];

  logger.info(`Sending query to AI Career Coach: "${message.substring(0, 40)}..."`);
  const responseText = await geminiService.generateCareerCoachResponse(message, formattedHistory);

  return res
    .status(200)
    .json(new ApiResponse(200, { response: responseText }, "Coach reply generated successfully"));
});
