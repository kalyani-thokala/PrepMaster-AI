import mongoose, { Schema } from "mongoose";

const codingSubmissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    codingTest: {
      type: Schema.Types.ObjectId,
      ref: "CodingTest",
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true,
      index: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    feedback: {
      type: String,
      default: ""
    },
    timeComplexity: {
      type: String,
      default: "N/A"
    },
    spaceComplexity: {
      type: String,
      default: "N/A"
    },
    improvements: {
      type: [String],
      default: []
    },
    rating: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"],
      default: "Average"
    },
    allPassed: {
      type: Boolean,
      required: true
    },
    passedCases: {
      type: Number,
      required: true,
      default: 0
    },
    totalCases: {
      type: Number,
      required: true,
      default: 0
    },
    executionTime: {
      type: Number, // in seconds or milliseconds
      default: 0
    },
    memoryUsage: {
      type: Number, // in KB
      default: 0
    }
  },
  {
    timestamps: true
  }
);

codingSubmissionSchema.index({ user: 1, createdAt: -1 });

export const CodingSubmission = mongoose.model("CodingSubmission", codingSubmissionSchema);
