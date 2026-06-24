import { Recommendations } from "../models/recommendations.model.js";
import { TestAttempt } from "../models/testAttempt.model.js";
import { geminiService } from "../services/gemini.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const getUserRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find latest saved recommendations
  const latestRec = await Recommendations.findOne({ user: userId }).sort({ createdAt: -1 });

  if (latestRec) {
    return res.status(200).json(new ApiResponse(200, latestRec, "AI recommendations fetched successfully."));
  }

  // If no saved recommendation, attempt to compile from user's weak topics in TestAttempts
  const attempts = await TestAttempt.find({ user: userId });
  const weakAreas = [];

  attempts.forEach((a) => {
    if (a.weakAreas) {
      a.weakAreas.forEach((w) => {
        if (!weakAreas.includes(w)) {
          weakAreas.push(w);
        }
      });
    }
  });

  if (weakAreas.length > 0) {
    try {
      logger.info(`Generating dynamic AI recommendation for weak areas: ${weakAreas.join(", ")}`);
      const rec = await geminiService.generateRecommendations(weakAreas);
      
      const newRec = await Recommendations.create({
        user: userId,
        weakTopics: weakAreas,
        guidance: rec.guidance,
        recommendedTopics: rec.recommendedTopics
      });
      
      return res.status(200).json(new ApiResponse(200, newRec, "AI recommendations generated dynamically."));
    } catch (err) {
      logger.error("Failed to generate recommendations: " + err.message);
    }
  }

  // Default empty state response
  const defaultRec = {
    user: userId,
    weakTopics: [],
    guidance: "Welcome! To unlock AI study recommendations and topic suggestions, complete at least one aptitude exam or coding challenge.",
    recommendedTopics: [
      { topic: "Quantitative Aptitude", description: "Practice speed and accuracy with percentage and ratio problems." },
      { topic: "Coding Arrays & Strings", description: "Master basic pointer manipulations and hash table tracking." }
    ]
  };

  return res.status(200).json(new ApiResponse(200, defaultRec, "Default recommendations returned."));
});
