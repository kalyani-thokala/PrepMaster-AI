import mongoose, { Schema } from "mongoose";

const performanceAnalyticsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true
    },
    weeklyProgress: [
      {
        week: { type: String, required: true }, // e.g. "2026-W25"
        testsCompleted: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 }
      }
    ],
    monthlyProgress: [
      {
        month: { type: String, required: true }, // e.g. "2026-06"
        testsCompleted: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 }
      }
    ],
    topicPerformance: [
      {
        topic: { type: String, required: true },
        score: { type: Number, default: 0 }
      }
    ],
    codingPerformance: [
      {
        language: { type: String, required: true },
        score: { type: Number, default: 0 }
      }
    ],
    aptitudePerformance: [
      {
        topic: { type: String, required: true },
        score: { type: Number, default: 0 }
      }
    ],
    accuracyTrend: [
      {
        date: { type: Date, required: true },
        accuracy: { type: Number, required: true }
      }
    ],
    testCompletionRate: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const PerformanceAnalytics = mongoose.model("PerformanceAnalytics", performanceAnalyticsSchema);
