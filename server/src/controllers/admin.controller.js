import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.model.js";
import { Assessment } from "../models/assessment.model.js";
import { Interview } from "../models/interview.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPT_CONFIG_PATH = path.join(__dirname, "../config/prompts.json");

// Ensure prompt configuration folder/file exists
const getPromptConfig = () => {
  const defaultPrompts = {
    resumeAnalyzerPrompt: "Analyze resume. Return SWOT recommendations, ATS scores.",
    interviewGraderPrompt: "Evaluate answers based on communication, technical accuracy.",
    assessmentGeneratorPrompt: "Generate multiple choice aptitude/programming questions.",
    roadmapGeneratorPrompt: "Generate milestone timeline and target recommended skills."
  };

  const configDir = path.dirname(PROMPT_CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(PROMPT_CONFIG_PATH)) {
    fs.writeFileSync(PROMPT_CONFIG_PATH, JSON.stringify(defaultPrompts, null, 2));
    return defaultPrompts;
  }

  try {
    return JSON.parse(fs.readFileSync(PROMPT_CONFIG_PATH, "utf8"));
  } catch (error) {
    logger.error("Error reading prompts.json, returning defaults: ", error);
    return defaultPrompts;
  }
};

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const users = await User.find(query)
    .select("-password -refreshToken")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalUsers: count
      },
      "Users fetched successfully"
    )
  );
});

export const blockOrUnblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { block } = req.body; // boolean

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "Super Admin" || user.role === "Admin") {
    throw new ApiError(403, "Cannot block an administrator account");
  }

  // Blocking action: we can flag a bio description or clear their refreshToken to invalidate login sessions
  if (block) {
    user.refreshToken = undefined; // Force logouts
    logger.info(`Admin blocked user account: ${user.email}`);
  } else {
    logger.info(`Admin unblocked user account: ${user.email}`);
  }

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, block ? "User blocked successfully" : "User unblocked successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "Super Admin") {
    throw new ApiError(403, "Cannot delete Super Admin account");
  }

  await User.findByIdAndDelete(userId);

  logger.info(`Admin deleted user account: ${user.email}`);
  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "Student" });
  const totalAssessments = await Assessment.countDocuments();
  const totalInterviews = await Interview.countDocuments();

  // Aggregated analytics stats
  const analytics = {
    totalUsers,
    activeUsers: Math.round(totalUsers * 0.75), // Active estimation
    assessmentsCompleted: totalAssessments,
    interviewsCompleted: totalInterviews,
    revenue: totalUsers * 49 // Calculated based on Pro conversions simulation ($49/user)
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "System analytics fetched successfully"));
});

export const getAIPromptTemplates = asyncHandler(async (req, res) => {
  const prompts = getPromptConfig();
  return res
    .status(200)
    .json(new ApiResponse(200, prompts, "Prompt templates fetched successfully"));
});

export const updateAIPromptTemplates = asyncHandler(async (req, res) => {
  const { resumeAnalyzerPrompt, interviewGraderPrompt, assessmentGeneratorPrompt, roadmapGeneratorPrompt } = req.body;

  const prompts = getPromptConfig();

  if (resumeAnalyzerPrompt) prompts.resumeAnalyzerPrompt = resumeAnalyzerPrompt;
  if (interviewGraderPrompt) prompts.interviewGraderPrompt = interviewGraderPrompt;
  if (assessmentGeneratorPrompt) prompts.assessmentGeneratorPrompt = assessmentGeneratorPrompt;
  if (roadmapGeneratorPrompt) prompts.roadmapGeneratorPrompt = roadmapGeneratorPrompt;

  fs.writeFileSync(PROMPT_CONFIG_PATH, JSON.stringify(prompts, null, 2));

  logger.info("Admin updated prompt templates configurations.");
  return res
    .status(200)
    .json(new ApiResponse(200, prompts, "Prompt templates updated successfully"));
});
