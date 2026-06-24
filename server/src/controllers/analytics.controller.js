import { TestAttempt } from "../models/testAttempt.model.js";
import { CodingSubmission } from "../models/codingSubmission.model.js";
import { AptitudeTest } from "../models/aptitudeTest.model.js";
import { CodingTest } from "../models/codingTest.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserPerformanceAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Weekly Progress (Aptitude + Coding combined per week)
  const aptitudeWeekly = await TestAttempt.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);
  const codingWeekly = await CodingSubmission.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);

  const weeklyMap = {};
  aptitudeWeekly.forEach((item) => {
    weeklyMap[item._id] = { week: item._id, aptitudeCount: item.count, codingCount: 0, avgAptitudeScore: Math.round(item.avgScore), avgCodingScore: 0 };
  });
  codingWeekly.forEach((item) => {
    if (weeklyMap[item._id]) {
      weeklyMap[item._id].codingCount = item.count;
      weeklyMap[item._id].avgCodingScore = Math.round(item.avgScore);
    } else {
      weeklyMap[item._id] = { week: item._id, aptitudeCount: 0, codingCount: item.count, avgAptitudeScore: 0, avgCodingScore: Math.round(item.avgScore) };
    }
  });
  const weeklyProgress = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));

  // 2. Monthly Progress
  const aptitudeMonthly = await TestAttempt.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);
  const codingMonthly = await CodingSubmission.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);

  const monthlyMap = {};
  aptitudeMonthly.forEach((item) => {
    monthlyMap[item._id] = { month: item._id, aptitudeCount: item.count, codingCount: 0, avgAptitudeScore: Math.round(item.avgScore), avgCodingScore: 0 };
  });
  codingMonthly.forEach((item) => {
    if (monthlyMap[item._id]) {
      monthlyMap[item._id].codingCount = item.count;
      monthlyMap[item._id].avgCodingScore = Math.round(item.avgScore);
    } else {
      monthlyMap[item._id] = { month: item._id, aptitudeCount: 0, codingCount: item.count, avgAptitudeScore: 0, avgCodingScore: Math.round(item.avgScore) };
    }
  });
  const monthlyProgress = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // 3. Topic Performance
  const topicPerformanceRes = await TestAttempt.aggregate([
    { $match: { user: userId } },
    { $unwind: "$topicBreakdown" },
    {
      $group: {
        _id: "$topicBreakdown.topic",
        avgScore: { $avg: { $multiply: [ { $divide: ["$topicBreakdown.correct", "$topicBreakdown.total"] }, 100 ] } }
      }
    }
  ]);
  const topicPerformance = topicPerformanceRes.map((t) => ({
    topic: t._id,
    avgScore: Math.round(t.avgScore)
  }));

  // 4. Coding Performance
  const codingPerformanceRes = await CodingSubmission.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$language",
        avgScore: { $avg: "$score" },
        count: { $sum: 1 }
      }
    }
  ]);
  const codingPerformance = codingPerformanceRes.map((c) => ({
    language: c._id,
    avgScore: Math.round(c.avgScore),
    submissionsCount: c.count
  }));

  // 5. Aptitude Performance
  const aptitudePerformanceRes = await TestAttempt.aggregate([
    { $match: { user: userId } },
    { $unwind: "$topicBreakdown" },
    {
      $group: {
        _id: "$topicBreakdown.topic",
        totalQuestions: { $sum: "$topicBreakdown.total" },
        correctQuestions: { $sum: "$topicBreakdown.correct" }
      }
    }
  ]);
  const aptitudePerformance = aptitudePerformanceRes.map((a) => ({
    topic: a._id,
    totalQuestions: a.totalQuestions,
    correctQuestions: a.correctQuestions,
    accuracy: a.totalQuestions > 0 ? Math.round((a.correctQuestions / a.totalQuestions) * 100) : 0
  }));

  // 6. Accuracy Trend
  const accuracyTrendRes = await TestAttempt.find({ user: userId })
    .select("createdAt accuracy")
    .sort({ createdAt: 1 });
  const accuracyTrend = accuracyTrendRes.map((item) => ({
    date: item.createdAt,
    accuracy: item.accuracy
  }));

  // 7. Completion Rate
  const generatedAptitude = await AptitudeTest.countDocuments({ user: userId });
  const generatedCoding = await CodingTest.countDocuments({ user: userId });
  const totalGenerated = generatedAptitude + generatedCoding;

  const attemptedAptitude = await TestAttempt.countDocuments({ user: userId });
  const attemptedCoding = await CodingSubmission.countDocuments({ user: userId });
  const totalAttempted = attemptedAptitude + attemptedCoding;

  const completionRate = totalGenerated > 0 ? Math.round((totalAttempted / totalGenerated) * 100) : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        weeklyProgress,
        monthlyProgress,
        topicPerformance,
        codingPerformance,
        aptitudePerformance,
        accuracyTrend,
        completionRate
      },
      "Performance analytics fetched successfully."
    )
  );
});
