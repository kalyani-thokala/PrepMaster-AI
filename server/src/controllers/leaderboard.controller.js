import { User } from "../models/user.model.js";
import { TestAttempt } from "../models/testAttempt.model.js";
import { CodingSubmission } from "../models/codingSubmission.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch leaderboard rankings using the composite formula:
// Score = (0.4 * Avg Aptitude Score) + (0.4 * Avg Coding Score) + min(Streak * 2, 50) + min(Total Tests * 1, 50)
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const students = await User.find({ role: "Student", isDeleted: { $ne: true } })
    .select("fullName email streak avatar achievements");

  // Calculate scores for all students
  const studentScores = await Promise.all(
    students.map(async (student) => {
      // Average Aptitude Score
      const aptAvg = await TestAttempt.aggregate([
        { $match: { user: student._id } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]);
      const avgAptitude = aptAvg.length > 0 ? aptAvg[0].avgScore : 0;

      // Average Coding Score
      const codingAvg = await CodingSubmission.aggregate([
        { $match: { user: student._id } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]);
      const avgCoding = codingAvg.length > 0 ? codingAvg[0].avgScore : 0;

      // Completed Tests Counts
      const aptCount = await TestAttempt.countDocuments({ user: student._id });
      const codingCount = await CodingSubmission.countDocuments({ user: student._id });
      const totalTests = aptCount + codingCount;

      // Formula:
      // Leaderboard Score = (0.4 * Avg Aptitude) + (0.4 * Avg Coding) + min(Streak * 2, 50) + min(Total Tests * 1, 50)
      const leaderboardScore = Math.round(
        (0.4 * avgAptitude + 0.4 * avgCoding + Math.min(student.streak * 2, 50) + Math.min(totalTests * 1, 50)) * 100
      ) / 100;

      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        streak: student.streak,
        avatar: student.avatar,
        achievements: student.achievements || [],
        readinessScore: leaderboardScore, // map to readinessScore for UI compatibility
        testsCompleted: totalTests
      };
    })
  );

  // Sort by score descending, then by streak descending
  studentScores.sort((a, b) => {
    if (b.readinessScore !== a.readinessScore) {
      return b.readinessScore - a.readinessScore;
    }
    return b.streak - a.streak;
  });

  const count = studentScores.length;
  const paginatedScores = studentScores.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Find current user's rank
  const currentUserIdx = studentScores.findIndex((u) => u._id.toString() === req.user._id.toString());
  const currentRank = currentUserIdx > -1 ? currentUserIdx + 1 : 1;
  const currentUserScore = currentUserIdx > -1 ? studentScores[currentUserIdx].readinessScore : 0;
  const currentUserTests = currentUserIdx > -1 ? studentScores[currentUserIdx].testsCompleted : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        rankings: paginatedScores,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        totalCandidates: count,
        currentUserStats: {
          rank: currentRank,
          readinessScore: currentUserScore,
          streak: req.user.streak,
          testsCompleted: currentUserTests,
          achievements: req.user.achievements || []
        }
      },
      "Leaderboard rankings fetched successfully"
    )
  );
});

// Unlock an achievement for the student
export const unlockAchievement = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if achievement already unlocked
  const alreadyUnlocked = user.achievements.some((a) => a.title === title);
  if (alreadyUnlocked) {
    return res
      .status(200)
      .json(new ApiResponse(200, user.achievements, "Achievement already unlocked"));
  }

  user.achievements.push({ title, description, unlockedAt: new Date() });
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user.achievements, `Achievement unlocked: ${title}`));
});
