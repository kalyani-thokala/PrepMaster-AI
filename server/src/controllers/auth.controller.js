import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOTPEmail } from "../services/mail.service.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

// Helper options for HTTP-only cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict"
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // Check duplicate user
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User registration failed. Try again.");
  }

  logger.info(`User registered successfully: ${createdUser.email}`);
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Adjust token cookie maxAge depending on rememberMe checkbox
  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
  };

  logger.info(`User logged in successfully: ${loggedInUser.email}`);
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 } // Unset refresh token in DB
    },
    { new: true }
  );

  logger.info(`User logged out successfully: ${req.user.email}`);
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized refresh request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  logger.info(`Access Token refreshed for: ${user.email}`);
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  user.otp = {
    code: otpCode,
    expiresAt: otpExpiresAt
  };
  await user.save({ validateBeforeSave: false });

  // Send Email
  const emailSent = await sendOTPEmail(user.email, user.fullName, otpCode);

  if (!emailSent) {
    throw new ApiError(500, "Failed to send verification email. Try again later.");
  }

  logger.info(`OTP generated and sent to: ${user.email}`);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification OTP sent to your registered email"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate OTP code and expiry
  if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP code");
  }

  user.password = password; // Hashed inside pre-save middleware
  user.otp = undefined; // Clear OTP data
  await user.save();

  logger.info(`Password reset completed successfully for: ${user.email}`);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { bio, skills, education, projects, certifications } = req.body;

  const user = await User.findById(req.user._id);

  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;
  if (education !== undefined) user.education = education;
  if (projects !== undefined) user.projects = projects;
  if (certifications !== undefined) user.certifications = certifications;

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  logger.info(`User profile updated: ${updatedUser.email}`);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});
