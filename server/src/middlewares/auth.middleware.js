import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Authenticate JWT Access Token
export const authenticateUser = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access - No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token - User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Authorize roles (Student, Admin, Super Admin)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden - Role '${req.user?.role || "Guest"}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

// Verify refresh token
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
