import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      default: ""
    },
    resumeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Resume = mongoose.model("Resume", resumeSchema);
