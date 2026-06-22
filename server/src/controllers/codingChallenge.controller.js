import { CodingChallenge } from "../models/codingChallenge.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { codeRunnerService } from "../services/coderunner.service.js";
import { logger } from "../utils/logger.js";

export const createCodingChallenge = asyncHandler(async (req, res) => {
  const { title, difficulty, topic, description, starterCode, testCases, solutions } = req.body;

  if (!title || !difficulty || !topic || !description || !starterCode || !testCases) {
    throw new ApiError(400, "All challenge properties are required");
  }

  const existing = await CodingChallenge.findOne({ title });
  if (existing) {
    throw new ApiError(409, "Coding challenge with this title already exists");
  }

  const challenge = await CodingChallenge.create({
    title,
    difficulty,
    topic,
    description,
    starterCode,
    testCases,
    solutions: solutions || []
  });

  logger.info(`Coding challenge created: ${title}`);
  return res
    .status(201)
    .json(new ApiResponse(201, challenge, "Coding challenge created successfully"));
});

export const getCodingChallenges = asyncHandler(async (req, res) => {
  const { difficulty, topic } = req.query;
  const filter = {};

  if (difficulty) filter.difficulty = difficulty;
  if (topic) filter.topic = topic;

  const challenges = await CodingChallenge.find(filter).select("-solutions -testCases"); // Strip solutions/test cases for list view
  return res
    .status(200)
    .json(new ApiResponse(200, challenges, "Coding challenges fetched successfully"));
});

export const getCodingChallengeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const challenge = await CodingChallenge.findById(id);

  if (!challenge) {
    throw new ApiError(404, "Coding challenge not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, challenge, "Coding challenge details fetched successfully"));
});

export const runChallengeCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language, code } = req.body;

  if (!language || !code) {
    throw new ApiError(400, "Language and code parameters are required");
  }

  const challenge = await CodingChallenge.findById(id);
  if (!challenge) {
    throw new ApiError(404, "Coding challenge not found");
  }

  logger.info(`Running code for Challenge ID: ${id}, Language: ${language}`);
  
  // Use the CodeRunner service
  const runResults = await codeRunnerService.runCode(language, code, challenge.testCases);

  const totalCases = runResults.length;
  const passedCases = runResults.filter((r) => r.passed).length;
  const allPassed = passedCases === totalCases;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allPassed,
        totalCases,
        passedCases,
        runResults
      },
      allPassed ? "All test cases passed!" : `${passedCases}/${totalCases} test cases passed.`
    )
  );
});
