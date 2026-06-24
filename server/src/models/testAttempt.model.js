import mongoose, { Schema } from "mongoose";

const testAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    aptitudeTest: {
      type: Schema.Types.ObjectId,
      ref: "AptitudeTest",
      required: true,
      index: true
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: String, default: "" },
        isCorrect: { type: Boolean, required: true }
      }
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    wrongAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    skippedAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    detailedExplanation: {
      type: String,
      default: ""
    },
    topicBreakdown: [
      {
        topic: { type: String, required: true },
        total: { type: Number, required: true },
        correct: { type: Number, required: true }
      }
    ],
    weakAreas: {
      type: [String],
      default: []
    },
    improvementSuggestions: {
      type: [String],
      default: []
    },
    duration: {
      type: Number, // duration of the test attempt in seconds
      required: true
    }
  },
  {
    timestamps: true
  }
);

testAttemptSchema.index({ user: 1, createdAt: -1 });

export const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
