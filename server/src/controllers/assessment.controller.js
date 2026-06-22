import { Assessment } from "../models/assessment.model.js";
import { User } from "../models/user.model.js";
import { AptitudeQuestion } from "../models/aptitudeQuestion.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const generateAssessment = asyncHandler(async (req, res) => {
  const { category, difficulty } = req.body;

  if (!category || !difficulty) {
    throw new ApiError(400, "Category and difficulty are required");
  }

  logger.info(`Generating assessment for Category: ${category}, Difficulty: ${difficulty}`);
  
  // Try to find questions with specific difficulty first
  let questions = await AptitudeQuestion.find({ category, difficulty });

  // If we don't have enough, fetch all questions of this category, ignoring difficulty tier, to guarantee 10 questions
  if (questions.length < 10) {
    logger.warn(`Only found ${questions.length} questions for ${category} with difficulty ${difficulty}. Fetching all questions from category.`);
    questions = await AptitudeQuestion.find({ category });
  }

  if (questions.length === 0) {
    throw new ApiError(404, `No questions found in database for category: ${category}`);
  }

  // Shuffle questions randomly and take up to 10
  questions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

  // Save the assessment to database containing all answers
  const assessment = await Assessment.create({
    user: req.user._id,
    category,
    difficulty,
    questions,
    answers: [],
    score: 0,
    report: {
      totalQuestions: questions.length,
      correctAnswers: 0,
      wrongAnswers: 0,
      skippedAnswers: questions.length,
      topicBreakdown: []
    }
  });

  // Strip correctOption & explanation from questions sent to the client to prevent client inspection cheating
  const clientQuestions = assessment.questions.map((q) => ({
    questionText: q.questionText,
    options: q.options,
    topic: q.topic,
    type: q.type
  }));

  logger.info(`Assessment generated successfully. ID: ${assessment._id}`);
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        assessmentId: assessment._id,
        category: assessment.category,
        difficulty: assessment.difficulty,
        questions: clientQuestions
      },
      "Assessment generated successfully"
    )
  );
});

export const submitAssessment = asyncHandler(async (req, res) => {
  const { assessmentId, userAnswers } = req.body; // userAnswers: [{ questionIndex, selectedOption }]

  if (!assessmentId || !userAnswers || !Array.isArray(userAnswers)) {
    throw new ApiError(400, "AssessmentId and userAnswers list are required");
  }

  const assessment = await Assessment.findOne({ _id: assessmentId, user: req.user._id });
  if (!assessment) {
    throw new ApiError(404, "Assessment details not found");
  }

  const questions = assessment.questions;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const topicMap = {}; // Tracks correctness per subtopic
  const answersList = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const userAns = userAnswers.find((ans) => ans.questionIndex === i);
    const correctVal = q.correctOption.trim();
    
    // Initialize topic tracking
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { total: 0, correct: 0 };
    }
    topicMap[q.topic].total += 1;

    if (!userAns || userAns.selectedOption === "" || userAns.selectedOption === null) {
      skippedCount += 1;
      answersList.push({
        questionIndex: i,
        selectedOption: "",
        isCorrect: false
      });
    } else {
      const isCorrect = userAns.selectedOption.trim() === correctVal;
      if (isCorrect) {
        correctCount += 1;
        topicMap[q.topic].correct += 1;
      } else {
        wrongCount += 1;
      }

      answersList.push({
        questionIndex: i,
        selectedOption: userAns.selectedOption,
        isCorrect
      });
    }
  }

  const calculatedScore = Math.round((correctCount / questions.length) * 100);

  // Map topic performance object list
  const topicBreakdown = Object.keys(topicMap).map((topicName) => ({
    topic: topicName,
    total: topicMap[topicName].total,
    correct: topicMap[topicName].correct
  }));

  // Update Assessment Details
  assessment.answers = answersList;
  assessment.score = calculatedScore;
  assessment.report = {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    skippedAnswers: skippedCount,
    topicBreakdown
  };

  await assessment.save();

  // Update user stats
  const user = await User.findById(req.user._id);
  if (user) {
    user.assessmentCount += 1;
    // Calculate new average readiness
    user.readinessScore = Math.round((user.readinessScore + calculatedScore) / 2);
    await user.save({ validateBeforeSave: false });
  }

  logger.info(`Assessment submitted. Score: ${calculatedScore}%`);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        assessmentId: assessment._id,
        score: calculatedScore,
        report: assessment.report,
        questions: assessment.questions // Return full questions now including correct answers + explanations for review
      },
      "Assessment submitted and graded successfully"
    )
  );
});

export const getAssessmentHistory = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, assessments, "Assessment history fetched successfully"));
});
