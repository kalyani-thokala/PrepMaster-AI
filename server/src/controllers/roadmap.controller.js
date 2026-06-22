import { Roadmap } from "../models/roadmap.model.js";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { Assessment } from "../models/assessment.model.js";
import { Interview } from "../models/interview.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geminiService } from "../services/gemini.service.js";
import { logger } from "../utils/logger.js";

export const generateRoadmap = asyncHandler(async (req, res) => {
  const { targetRole, currentSkills } = req.body;

  if (!targetRole) {
    throw new ApiError(400, "Target role is required");
  }

  // Ensure currentSkills is an array
  const skillsArray = Array.isArray(currentSkills) ? currentSkills : req.user.skills || [];

  logger.info(`Generating learning roadmap for target role: ${targetRole}`);
  const roadmapData = await geminiService.generateRoadmap(targetRole, skillsArray);

  // Remove existing roadmap for this user to keep it clean (one active roadmap model)
  await Roadmap.deleteMany({ user: req.user._id });

  // Save the new roadmap
  const roadmap = await Roadmap.create({
    user: req.user._id,
    targetRole: roadmapData.targetRole || targetRole,
    currentSkills: roadmapData.currentSkills || skillsArray,
    missingSkills: roadmapData.missingSkills || [],
    milestones: roadmapData.milestones || [],
    timeline: roadmapData.timeline || "8 Weeks"
  });

  // Update user target skills in DB
  const user = await User.findById(req.user._id);
  if (user) {
    // Add missing skills to user profile under recommended study
    user.skills = Array.from(new Set([...user.skills, ...skillsArray]));
    await user.save({ validateBeforeSave: false });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, roadmap, "Personalized roadmap generated successfully"));
});

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.user._id });

  if (!roadmap) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No active roadmap found. Please generate one."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, roadmap, "Roadmap fetched successfully"));
});

export const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { milestoneId, status } = req.body;

  if (!milestoneId || !status) {
    throw new ApiError(400, "MilestoneId and status are required");
  }

  if (!["Not Started", "In Progress", "Completed"].includes(status)) {
    throw new ApiError(400, "Invalid status type");
  }

  const roadmap = await Roadmap.findOne({ user: req.user._id });
  if (!roadmap) {
    throw new ApiError(404, "No active roadmap found for user");
  }

  const milestone = roadmap.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  milestone.status = status;
  await roadmap.save();

  return res
    .status(200)
    .json(new ApiResponse(200, roadmap, "Milestone status updated successfully"));
});

export const getPlacementReadiness = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Gather stats from the DB
  const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  
  const assessments = await Assessment.find({ user: userId });
  const totalAssessments = assessments.length;
  const avgAssessmentScore = totalAssessments > 0
    ? Math.round(assessments.reduce((acc, a) => acc + a.score, 0) / totalAssessments)
    : 0;

  const interviews = await Interview.find({ user: userId });
  const totalInterviews = interviews.length;
  const avgInterviewScore = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.score, 0) / totalInterviews)
    : 0;

  // 2. Format details for Gemini Evaluator
  const profileDetails = {
    fullName: req.user.fullName,
    skills: req.user.skills
  };

  const resumeStats = {
    score: resume?.resumeScore || 0,
    atsScore: resume?.atsScore || 0
  };

  const assessmentStats = {
    total: totalAssessments,
    avgScore: avgAssessmentScore
  };

  const interviewStats = {
    total: totalInterviews,
    avgScore: avgInterviewScore
  };

  logger.info("Calling Gemini to calculate placement readiness index...");
  const evaluation = await geminiService.evaluatePlacementReadiness(
    profileDetails.fullName,
    profileDetails.skills,
    resumeStats,
    assessmentStats,
    interviewStats
  );

  // Update user's aggregate readiness score
  const user = await User.findById(userId);
  if (user) {
    user.readinessScore = evaluation.overallReadiness;
    await user.save({ validateBeforeSave: false });
  }

  // Calculate current user's rank
  const higherRankedCount = await User.countDocuments({
    role: "Student",
    $or: [
      { readinessScore: { $gt: evaluation.overallReadiness } },
      { readinessScore: evaluation.overallReadiness, streak: { $gt: req.user?.streak || 0 } }
    ]
  });
  const currentRank = higherRankedCount + 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overallReadiness: evaluation.overallReadiness,
        codingReadiness: evaluation.codingReadiness,
        aptitudeReadiness: evaluation.aptitudeReadiness,
        communicationReadiness: evaluation.communicationReadiness,
        interviewReadiness: evaluation.interviewReadiness,
        recommendedActions: evaluation.recommendedActions,
        rank: currentRank
      },
      "Placement readiness computed successfully"
    )
  );
});
