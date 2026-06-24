import { TestAttempt } from "../models/testAttempt.model.js";
import { CodingSubmission } from "../models/codingSubmission.model.js";
import { Interview } from "../models/interview.model.js";
import { Resume } from "../models/resume.model.js";
import { Roadmap } from "../models/roadmap.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Counts
  const totalAptitudeTests = await TestAttempt.countDocuments({ user: userId });
  const totalCodingChallenges = await CodingSubmission.countDocuments({ user: userId });
  const totalTestsTaken = totalAptitudeTests + totalCodingChallenges;

  const interviewSessions = await Interview.countDocuments({ user: userId });
  const resumeAnalyses = await Resume.countDocuments({ user: userId });
  const roadmapsGenerated = await Roadmap.countDocuments({ user: userId });

  // 2. Scores
  const avgAptitudeRes = await TestAttempt.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, avgScore: { $avg: "$score" } } }
  ]);
  const avgAptitudeScore = avgAptitudeRes.length > 0 ? Math.round(avgAptitudeRes[0].avgScore) : 0;

  const avgCodingRes = await CodingSubmission.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, avgScore: { $avg: "$score" } } }
  ]);
  const avgCodingScore = avgCodingRes.length > 0 ? Math.round(avgCodingRes[0].avgScore) : 0;

  // 3. Questions Answered & Accuracy
  const questionsRes = await TestAttempt.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        correct: { $sum: "$correctAnswers" },
        wrong: { $sum: "$wrongAnswers" },
        skipped: { $sum: "$skippedAnswers" }
      }
    }
  ]);

  const correctCount = questionsRes.length > 0 ? questionsRes[0].correct : 0;
  const wrongCount = questionsRes.length > 0 ? questionsRes[0].wrong : 0;
  const questionsAnswered = correctCount + wrongCount;
  const accuracyPercentage = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;

  // 4. Weekly Activity Graph (last 7 days activity count)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyAptitude = await TestAttempt.aggregate([
    { $match: { user: userId, createdAt: { $gte: oneWeekAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);
  const weeklyCoding = await CodingSubmission.aggregate([
    { $match: { user: userId, createdAt: { $gte: oneWeekAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  // Combine weekly counts
  const weeklyMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    weeklyMap[dayStr] = { date: dayStr, aptitude: 0, coding: 0, total: 0 };
  }
  weeklyAptitude.forEach((item) => {
    if (weeklyMap[item._id]) {
      weeklyMap[item._id].aptitude = item.count;
      weeklyMap[item._id].total += item.count;
    }
  });
  weeklyCoding.forEach((item) => {
    if (weeklyMap[item._id]) {
      weeklyMap[item._id].coding = item.count;
      weeklyMap[item._id].total += item.count;
    }
  });
  const weeklyActivity = Object.values(weeklyMap).sort((a, b) => a.date.localeCompare(b.date));

  // 5. Monthly Activity Graph (last 6 months activity)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyAptitude = await TestAttempt.aggregate([
    { $match: { user: userId, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);
  const monthlyCoding = await CodingSubmission.aggregate([
    { $match: { user: userId, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    }
  ]);

  const monthlyMap = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
    monthlyMap[monthStr] = { month: monthStr, aptitude: 0, coding: 0, total: 0, avgAptitudeScore: 0, avgCodingScore: 0 };
  }
  monthlyAptitude.forEach((item) => {
    if (monthlyMap[item._id]) {
      monthlyMap[item._id].aptitude = item.count;
      monthlyMap[item._id].total += item.count;
      monthlyMap[item._id].avgAptitudeScore = Math.round(item.avgScore);
    }
  });
  monthlyCoding.forEach((item) => {
    if (monthlyMap[item._id]) {
      monthlyMap[item._id].coding = item.count;
      monthlyMap[item._id].total += item.count;
      monthlyMap[item._id].avgCodingScore = Math.round(item.avgScore);
    }
  });
  const monthlyActivity = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // 6. Recent Attempted Tests
  const recentAptitude = await TestAttempt.find({ user: userId })
    .populate("aptitudeTest", "topic difficulty")
    .sort({ createdAt: -1 })
    .limit(5);
  const recentCoding = await CodingSubmission.find({ user: userId })
    .populate("codingTest", "topic difficulty title")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentTests = [
    ...recentAptitude.map((t) => ({
      _id: t._id,
      type: "Aptitude",
      title: t.aptitudeTest?.topic || "Aptitude Test",
      score: t.score,
      difficulty: t.aptitudeTest?.difficulty || "Medium",
      date: t.createdAt
    })),
    ...recentCoding.map((c) => ({
      _id: c._id,
      type: "Coding",
      title: c.codingTest?.title || "Coding Challenge",
      score: c.score,
      difficulty: c.codingTest?.difficulty || "Medium",
      date: c.createdAt
    }))
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  // 7. Skill Improvement Trend (Top 5 topics & historical score average)
  const aptitudeTopics = await TestAttempt.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$topicBreakdown.topic", avgScore: { $avg: "$score" } } }
  ]);
  const skillImprovementTrend = aptitudeTopics.map((t) => ({
    skill: Array.isArray(t._id) ? t._id[0] : t._id || "General",
    score: Math.round(t.avgScore)
  })).slice(0, 5);

  // 8. Leaderboard Position calculation using the updated formula:
  // Leaderboard Score = (0.4 * Average Aptitude Score) + (0.4 * Average Coding Score) + min(Streak * 2, 50) + min(Total Tests * 1, 50)
  const currentUser = await User.findById(userId);
  const allUsers = await User.find({ role: "Student", isDeleted: { $ne: true } });

  // Calculate scores for all users
  const userRankings = await Promise.all(
    allUsers.map(async (u) => {
      // Aptitude Avg
      const aptAvg = await TestAttempt.aggregate([
        { $match: { user: u._id } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]);
      const avgA = aptAvg.length > 0 ? aptAvg[0].avgScore : 0;

      // Coding Avg
      const codAvg = await CodingSubmission.aggregate([
        { $match: { user: u._id } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]);
      const avgC = codAvg.length > 0 ? codAvg[0].avgScore : 0;

      const totalA = await TestAttempt.countDocuments({ user: u._id });
      const totalC = await CodingSubmission.countDocuments({ user: u._id });
      const totalT = totalA + totalC;

      const score = 0.4 * avgA + 0.4 * avgC + Math.min(u.streak * 2, 50) + Math.min(totalT * 1, 50);

      return {
        userId: u._id,
        score: Math.round(score * 100) / 100
      };
    })
  );

  // Sort rankings descending
  userRankings.sort((a, b) => b.score - a.score);

  // Find user's rank
  const userRankIdx = userRankings.findIndex((r) => r.userId.toString() === userId.toString());
  const leaderboardRank = userRankIdx > -1 ? userRankIdx + 1 : 1;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalTestsTaken,
        totalAptitudeTests,
        totalCodingChallenges,
        avgAptitudeScore,
        avgCodingScore,
        interviewSessions,
        resumeAnalyses,
        roadmapsGenerated,
        weeklyActivity,
        monthlyActivity,
        recentTests,
        skillImprovementTrend,
        accuracyPercentage,
        leaderboardRank,
        questionsAnswered
      },
      "Dashboard stats calculated dynamically from database successfully"
    )
  );
});
