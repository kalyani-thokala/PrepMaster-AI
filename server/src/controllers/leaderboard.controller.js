import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch leaderboard rankings by readinessScore
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const users = await User.find({ role: "Student" })
    .select("fullName email readinessScore streak avatar")
    .sort({ readinessScore: -1, streak: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await User.countDocuments({ role: "Student" });

  // Calculate current user's rank
  const currentUser = await User.findById(req.user._id);
  const higherRankedCount = await User.countDocuments({
    role: "Student",
    $or: [
      { readinessScore: { $gt: currentUser.readinessScore } },
      { readinessScore: currentUser.readinessScore, streak: { $gt: currentUser.streak } }
    ]
  });
  const currentRank = higherRankedCount + 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        rankings: users,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalCandidates: count,
        currentUserStats: {
          rank: currentRank,
          readinessScore: currentUser.readinessScore,
          streak: currentUser.streak,
          achievements: currentUser.achievements || []
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
