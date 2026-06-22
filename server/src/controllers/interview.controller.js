import { Interview } from "../models/interview.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geminiService } from "../services/gemini.service.js";
import { logger } from "../utils/logger.js";

// Standard question templates for fast fallback / role generation
const DEFAULT_ROLE_QUESTIONS = {
  "Software Engineer": [
    { questionId: "se_1", text: "What is the difference between a process and a thread?", category: "Technical" },
    { questionId: "se_2", text: "Explain the concept of RESTful API design. What are the key HTTP methods and their idempotency?", category: "Technical" },
    { questionId: "se_3", text: "Tell me about a time you had to deal with a conflict in a team project. How did you resolve it?", category: "Behavioral" },
    { questionId: "se_4", text: "If a production server goes down and you cannot access the logs, what would be your initial troubleshooting steps?", category: "Scenario" },
    { questionId: "se_5", text: "Why do you want to join our organization as a Software Engineer?", category: "HR" }
  ],
  "Frontend Engineer": [
    { questionId: "fe_1", text: "Explain React's virtual DOM reconciliation process and how Fiber improves rendering performance.", category: "Technical" },
    { questionId: "fe_2", text: "What are the different methods of optimizing frontend page performance (loading speed, interactivity)?", category: "Technical" },
    { questionId: "fe_3", text: "Tell me about a complex UI component you built. What were the challenges and how did you resolve them?", category: "Behavioral" },
    { questionId: "fe_4", text: "If a user reports that a page is lagging on low-end mobile devices, how would you debug and fix this?", category: "Scenario" },
    { questionId: "fe_5", text: "What excites you most about modern frontend development and CSS frameworks?", category: "HR" }
  ]
};

export const generateInterview = asyncHandler(async (req, res) => {
  const { role, difficulty } = req.body;

  if (!role || !difficulty) {
    throw new ApiError(400, "Role and difficulty level are required");
  }

  // Load questions - check template first, fallback to dynamic Gemini generation if template isn't present
  let questions = DEFAULT_ROLE_QUESTIONS[role] || DEFAULT_ROLE_QUESTIONS["Software Engineer"];

  // Replace IDs with unique keys for the session
  questions = questions.map((q, idx) => ({
    questionId: `q_${Date.now()}_${idx}`,
    text: q.text,
    category: q.category
  }));

  // Create an initial interview session (answers and feedback will be updated later)
  const interviewSession = await Interview.create({
    user: req.user._id,
    role,
    difficulty,
    questions,
    answers: [],
    feedback: { strengths: [], weaknesses: [], recommendations: [] },
    score: 0,
    duration: 0
  });

  logger.info(`Interview session created for: ${req.user.email} (Role: ${role})`);
  return res
    .status(201)
    .json(new ApiResponse(201, interviewSession, "Interview session generated successfully"));
});

export const submitInterviewAnswer = asyncHandler(async (req, res) => {
  const { interviewId, questionId, answerText } = req.body;

  if (!interviewId || !questionId || answerText === undefined) {
    throw new ApiError(400, "InterviewId, questionId and answerText are required");
  }

  const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
  if (!interview) {
    throw new ApiError(404, "Interview session not found");
  }

  const question = interview.questions.find((q) => q.questionId === questionId);
  if (!question) {
    throw new ApiError(404, "Question not found in this interview session");
  }

  // Evaluate candidate answer using Gemini AI
  logger.info(`Evaluating answer for interview question: ${question.text}`);
  const evaluation = await geminiService.evaluateMockInterview(interview.role, question.text, answerText);

  // Check if answer already exists, otherwise push
  const existingAnswerIndex = interview.answers.findIndex((ans) => ans.questionId === questionId);
  const answerObject = {
    questionId,
    questionText: question.text,
    answerText,
    evaluation: {
      score: evaluation.score,
      technicalAccuracy: evaluation.technicalAccuracy,
      communication: evaluation.communication,
      confidence: evaluation.confidence,
      clarity: evaluation.clarity,
      feedbackText: evaluation.feedbackText
    }
  };

  if (existingAnswerIndex > -1) {
    interview.answers[existingAnswerIndex] = answerObject;
  } else {
    interview.answers.push(answerObject);
  }

  await interview.save();

  return res
    .status(200)
    .json(new ApiResponse(200, answerObject, "Answer evaluated and stored successfully"));
});

export const finalizeInterview = asyncHandler(async (req, res) => {
  const { interviewId, duration } = req.body;

  const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
  if (!interview) {
    throw new ApiError(404, "Interview session not found");
  }

  if (interview.answers.length === 0) {
    throw new ApiError(400, "Cannot finalize interview without any submitted answers");
  }

  // Calculate overall statistics
  const totalAnswers = interview.answers.length;
  const sumScores = interview.answers.reduce((acc, ans) => acc + ans.evaluation.score, 0);
  const averageScore = Math.round(sumScores / totalAnswers);

  // Collate SWOT recommendations using details from individual answer evaluations
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  interview.answers.forEach((ans) => {
    if (ans.evaluation.score >= 80) {
      strengths.push(`Strong answer structure for: "${ans.questionText.substring(0, 30)}..."`);
    } else {
      weaknesses.push(`Needs depth for question: "${ans.questionText.substring(0, 30)}..."`);
      recommendations.push(`Review answer feedback for: "${ans.questionText.substring(0, 30)}..."`);
    }
  });

  interview.score = averageScore;
  interview.duration = duration || 0;
  interview.feedback = {
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 5)
  };

  await interview.save();

  // Increment user count and update readiness index
  const user = await User.findById(req.user._id);
  if (user) {
    user.interviewCount += 1;
    user.readinessScore = Math.round((user.readinessScore + averageScore) / 2);
    await user.save({ validateBeforeSave: false });
  }

  logger.info(`Interview finalized. Overall Score: ${averageScore}%`);
  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview session finalized successfully"));
});

export const getInterviewHistory = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, interviews, "Interview history fetched successfully"));
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interview = await Interview.findOne({ _id: id, user: req.user._id });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview details fetched successfully"));
});
