import { AptitudeTest } from "../models/aptitudeTest.model.js";
import { TestAttempt } from "../models/testAttempt.model.js";
import { Recommendations } from "../models/recommendations.model.js";
import { User } from "../models/user.model.js";
import { geminiService } from "../services/gemini.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

// Fisher-Yates Shuffle
const shuffleOptions = (options, correctAnswer) => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    options: shuffled,
    correctAnswer: correctAnswer // correctAnswer value stays the same string
  };
};

export const generateAptitudeTest = asyncHandler(async (req, res) => {
  const { topic, difficulty, questionCount = 10 } = req.body;
  const userId = req.user._id;

  if (!topic || !difficulty) {
    throw new ApiError(400, "Topic and difficulty are required parameters.");
  }

  const parsedCount = Number(questionCount);
  if (![10, 15, 20].includes(parsedCount)) {
    throw new ApiError(400, "Question count must be 10, 15, or 20.");
  }

  // Determine Duration
  let duration = 900; // 15 minutes for 10
  if (parsedCount === 15) duration = 1200; // 20 minutes
  else if (parsedCount === 20) duration = 1800; // 30 minutes

  logger.info(`Fetching last 20 attempts to ensure question uniqueness for User: ${userId}`);
  const pastAttempts = await TestAttempt.find({ user: userId })
    .populate("aptitudeTest")
    .sort({ createdAt: -1 })
    .limit(20);

  const excludeQuestions = [];
  pastAttempts.forEach((attempt) => {
    if (attempt.aptitudeTest?.questions) {
      attempt.aptitudeTest.questions.forEach((q) => {
        excludeQuestions.push(q.question);
      });
    }
  });

  logger.info(`Generating ${parsedCount} questions for topic: ${topic}, difficulty: ${difficulty} using Gemini`);
  const generated = await geminiService.generateAptitudeQuestions(
    topic,
    difficulty,
    parsedCount,
    excludeQuestions
  );

  // Shuffle option arrays for each generated question
  const shuffledQuestions = generated.map((q) => {
    const shuffleResult = shuffleOptions(q.options, q.correctAnswer);
    return {
      question: q.question,
      options: shuffleResult.options,
      correctAnswer: shuffleResult.correctAnswer,
      explanation: q.explanation,
      topic: topic,
      difficulty: difficulty,
      marks: 1
    };
  });

  // Store the generated test
  const aptitudeTest = await AptitudeTest.create({
    user: userId,
    topic,
    difficulty,
    questions: shuffledQuestions,
    duration
  });

  // Strip correctAnswer and explanation for front-end safety
  const clientQuestions = aptitudeTest.questions.map((q, idx) => ({
    questionIndex: idx,
    question: q.question,
    options: q.options,
    topic: q.topic,
    difficulty: q.difficulty
  }));

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        aptitudeTestId: aptitudeTest._id,
        topic: aptitudeTest.topic,
        difficulty: aptitudeTest.difficulty,
        duration: aptitudeTest.duration,
        questions: clientQuestions
      },
      "Unique aptitude test generated successfully"
    )
  );
});

export const submitAptitudeTest = asyncHandler(async (req, res) => {
  const { aptitudeTestId, answers, durationTaken = 0 } = req.body; // answers: [{ questionIndex, selectedOption }]
  const userId = req.user._id;

  if (!aptitudeTestId || !answers || !Array.isArray(answers)) {
    throw new ApiError(400, "aptitudeTestId and answers list are required.");
  }

  // Prevent duplicate submissions
  const existingAttempt = await TestAttempt.findOne({ user: userId, aptitudeTest: aptitudeTestId });
  if (existingAttempt) {
    throw new ApiError(400, "This assessment test has already been submitted.");
  }

  const aptitudeTest = await AptitudeTest.findById(aptitudeTestId);
  if (!aptitudeTest) {
    throw new ApiError(404, "Aptitude test template not found.");
  }

  // Validate owner
  if (aptitudeTest.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden - You do not own this test template.");
  }

  const questions = aptitudeTest.questions;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const answersList = [];
  const topicMap = {}; // to calculate correctness breakdown

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const userAns = answers.find((ans) => ans.questionIndex === i);
    const correctVal = q.correctAnswer.trim();

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

  const score = Math.round((correctCount / questions.length) * 100);
  const accuracy = (correctCount + wrongCount) > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

  const topicBreakdown = Object.keys(topicMap).map((topicName) => ({
    topic: topicName,
    total: topicMap[topicName].total,
    correct: topicMap[topicName].correct
  }));

  // Identify Weak Areas
  const weakAreas = [];
  topicBreakdown.forEach((t) => {
    const acc = t.total > 0 ? (t.correct / t.total) * 100 : 0;
    if (acc < 70) {
      weakAreas.push(t.topic);
    }
  });

  // Call Gemini in the background or synchronously to yield study suggestions
  let recommendationsText = "Keep practicing!";
  let recommendedTopics = [];
  if (weakAreas.length > 0) {
    try {
      const rec = await geminiService.generateRecommendations(weakAreas);
      recommendationsText = rec.guidance;
      recommendedTopics = rec.recommendedTopics;

      // Save Recommendations to DB
      await Recommendations.create({
        user: userId,
        weakTopics: weakAreas,
        guidance: recommendationsText,
        recommendedTopics: recommendedTopics
      });
    } catch (err) {
      logger.error("Error generating recommendations: ", err);
    }
  }

  // Save Attempt
  const attempt = await TestAttempt.create({
    user: userId,
    aptitudeTest: aptitudeTestId,
    answers: answersList,
    score,
    accuracy,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    skippedAnswers: skippedCount,
    detailedExplanation: `Test completed with score ${score}%. Strong performance in completed topics. Core review suggested for weak areas.`,
    topicBreakdown,
    weakAreas,
    improvementSuggestions: recommendedTopics.map((t) => t.description || `Reinforce concepts in ${t.topic}`),
    duration: Number(durationTaken) || aptitudeTest.duration
  });

  // Update user stats
  const user = await User.findById(userId);
  if (user) {
    user.streak += 1;
    // calculate average readiness index
    user.readinessScore = Math.round((user.readinessScore + score) / 2);
    await user.save({ validateBeforeSave: false });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        score: attempt.score,
        accuracy: attempt.accuracy,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        skippedAnswers: attempt.skippedAnswers,
        topicBreakdown: attempt.topicBreakdown,
        weakAreas: attempt.weakAreas,
        improvementSuggestions: attempt.improvementSuggestions,
        questions: aptitudeTest.questions // Full question key now returned including explanations + correct answers
      },
      "Test submission evaluated successfully"
    )
  );
});

export const getAptitudeHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { topic, difficulty, startDate, endDate } = req.query;

  const query = { user: userId };

  // Setup date range filters
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // We need to query TestAttempts and populate its AptitudeTest details for topic/difficulty filtering
  let attempts = await TestAttempt.find(query)
    .populate({
      path: "aptitudeTest",
      select: "topic difficulty duration"
    })
    .sort({ createdAt: -1 });

  // Apply filters on populated properties manually (or filter in query)
  if (topic) {
    attempts = attempts.filter((a) => a.aptitudeTest?.topic?.toLowerCase() === topic.toLowerCase());
  }
  if (difficulty) {
    attempts = attempts.filter((a) => a.aptitudeTest?.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }

  return res.status(200).json(new ApiResponse(200, attempts, "Aptitude test history fetched successfully"));
});
