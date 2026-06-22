import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geminiService } from "../services/gemini.service.js";
import { logger } from "../utils/logger.js";

// Helper function to extract text based on extension
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const parsedPdf = await pdf(dataBuffer);
    return parsedPdf.text;
  } else if (ext === ".docx") {
    const docxResult = await mammoth.extractRawText({ path: filePath });
    return docxResult.value;
  } else {
    throw new Error("Unsupported file extension");
  }
};

export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a resume file (PDF or DOCX)");
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    logger.info(`Extracting text from uploaded file: ${fileName}`);
    const extractedText = await extractTextFromFile(filePath);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new ApiError(400, "Could not extract readable text from the uploaded file.");
    }

    logger.info("Calling Gemini API for resume analysis and ATS scanning...");
    const analysis = await geminiService.analyzeResume(extractedText);

    // Create and save Resume in Database
    const resumeAnalysis = await Resume.create({
      user: req.user._id,
      fileName,
      extractedText,
      resumeScore: analysis.score,
      atsScore: analysis.atsScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      missingSkills: analysis.missingSkills,
      recommendations: analysis.suggestions
    });

    // Update user readinessScore based on resume analysis (just an aggregation, e.g. set it directly or compute average)
    const user = await User.findById(req.user._id);
    if (user) {
      // Calculate a simple weighted update
      user.readinessScore = Math.round((user.readinessScore + analysis.atsScore) / 2);
      await user.save({ validateBeforeSave: false });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resumeAnalysis, "Resume analyzed successfully"));

  } catch (error) {
    logger.error("Error during resume analysis: ", error);
    throw new ApiError(500, error.message || "Failed to analyze resume.");
  } finally {
    // Delete local file after processing is done
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Cleaned up temp file: ${filePath}`);
    }
  }
});

export const getResumeHistory = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, resumes, "Resume history fetched successfully"));
});

export const getResumeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resume = await Resume.findOne({ _id: id, user: req.user._id });

  if (!resume) {
    throw new ApiError(404, "Resume analysis not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resume, "Resume details fetched successfully"));
});
