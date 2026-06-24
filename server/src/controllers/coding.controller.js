import { CodingTest } from "../models/codingTest.model.js";
import { CodingSubmission } from "../models/codingSubmission.model.js";
import { geminiService } from "../services/gemini.service.js";
import { codeRunnerService } from "../services/coderunner.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const generateCodingTest = asyncHandler(async (req, res) => {
  const { topic, difficulty } = req.body;
  const userId = req.user._id;

  if (!topic || !difficulty) {
    throw new ApiError(400, "Topic and difficulty are required parameters.");
  }

  logger.info(`Generating coding challenge for Topic: ${topic}, Difficulty: ${difficulty} using Gemini`);
  const problem = await geminiService.generateCodingChallenge(topic, difficulty);

  // Store in database
  const codingTest = await CodingTest.create({
    user: userId,
    topic,
    difficulty,
    title: problem.title,
    description: problem.description,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    examples: problem.examples || [],
    testCases: problem.testCases || [],
    hiddenTestCases: problem.hiddenTestCases || [],
    starterCode: problem.starterCode || []
  });

  // Strip hidden test cases for security
  const clientResponse = {
    codingTestId: codingTest._id,
    topic: codingTest.topic,
    difficulty: codingTest.difficulty,
    title: codingTest.title,
    description: codingTest.description,
    inputFormat: codingTest.inputFormat,
    outputFormat: codingTest.outputFormat,
    constraints: codingTest.constraints,
    examples: codingTest.examples,
    testCases: codingTest.testCases, // only sample test cases
    starterCode: codingTest.starterCode
  };

  return res.status(201).json(new ApiResponse(201, clientResponse, "Coding challenge generated successfully."));
});

export const submitCodingTest = asyncHandler(async (req, res) => {
  const { codingTestId, code, language } = req.body;
  const userId = req.user._id;

  if (!codingTestId || !code || !language) {
    throw new ApiError(400, "codingTestId, code, and language parameters are required.");
  }

  const codingTest = await CodingTest.findById(codingTestId);
  if (!codingTest) {
    throw new ApiError(404, "Coding test template not found.");
  }

  // Combine sample test cases and hidden test cases for execution
  const allTestCases = [
    ...codingTest.testCases,
    ...codingTest.hiddenTestCases
  ];

  logger.info(`Executing code for Test ID: ${codingTestId}, Language: ${language} against ${allTestCases.length} test cases`);
  const executionResults = await codeRunnerService.runCode(language, code, allTestCases);

  const totalCases = executionResults.length;
  const passedCases = executionResults.filter((r) => r.passed).length;
  const allPassed = passedCases === totalCases;

  // Calculate execution time and memory usage (max across runs)
  const maxTime = executionResults.reduce((max, r) => Math.max(max, r.time || 0), 0);
  const maxMemory = executionResults.reduce((max, r) => Math.max(max, r.memory || 0), 0);

  const testResultsSummary = {
    allPassed,
    totalCases,
    passedCases,
    failedCases: totalCases - passedCases,
    executionResults: executionResults.map((r, idx) => ({
      testCaseIndex: idx,
      isSample: idx < codingTest.testCases.length,
      passed: r.passed,
      time: r.time,
      memory: r.memory
    }))
  };

  logger.info(`Calling Gemini static analysis for code evaluation...`);
  const evaluation = await geminiService.evaluateCodeSubmission(
    codingTest.title,
    codingTest.description,
    language,
    code,
    testResultsSummary
  );

  // Save submission to DB
  const submission = await CodingSubmission.create({
    user: userId,
    codingTest: codingTestId,
    code,
    language,
    score: evaluation.score,
    feedback: evaluation.feedback,
    timeComplexity: evaluation.timeComplexity,
    spaceComplexity: evaluation.spaceComplexity,
    improvements: evaluation.improvements,
    rating: evaluation.rating,
    allPassed,
    passedCases,
    totalCases,
    executionTime: maxTime,
    memoryUsage: maxMemory
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        submissionId: submission._id,
        score: submission.score,
        rating: submission.rating,
        feedback: submission.feedback,
        timeComplexity: submission.timeComplexity,
        spaceComplexity: submission.spaceComplexity,
        improvements: submission.improvements,
        allPassed: submission.allPassed,
        passedCases: submission.passedCases,
        totalCases: submission.totalCases,
        executionTime: submission.executionTime,
        memoryUsage: submission.memoryUsage,
        executionResults: executionResults // returning full execution outputs for user debug console
      },
      allPassed ? "All test cases passed!" : `${passedCases}/${totalCases} test cases passed.`
    )
  );
});

export const getCodingHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { topic, difficulty, startDate, endDate } = req.query;

  const query = { user: userId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  let submissions = await CodingSubmission.find(query)
    .populate({
      path: "codingTest",
      select: "title topic difficulty"
    })
    .sort({ createdAt: -1 });

  if (topic) {
    submissions = submissions.filter((s) => s.codingTest?.topic?.toLowerCase() === topic.toLowerCase());
  }
  if (difficulty) {
    submissions = submissions.filter((s) => s.codingTest?.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }

  return res.status(200).json(new ApiResponse(200, submissions, "Coding history fetched successfully."));
});
