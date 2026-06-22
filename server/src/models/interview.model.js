import mongoose, { Schema } from "mongoose";

const interviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    questions: [
      {
        questionId: String,
        text: String,
        category: {
          type: String,
          enum: ["Technical", "HR", "Behavioral", "Scenario"]
        }
      }
    ],
    answers: [
      {
        questionId: String,
        questionText: String,
        answerText: String,
        evaluation: {
          score: Number,
          technicalAccuracy: String,
          communication: String,
          confidence: String,
          clarity: String,
          feedbackText: String
        }
      }
    ],
    feedback: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String]
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    duration: {
      type: Number, // in seconds
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Interview = mongoose.model("Interview", interviewSchema);
