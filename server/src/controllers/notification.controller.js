import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch notifications for authenticated user with pagination support
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Notification.countDocuments({ user: req.user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalNotifications: count
      },
      "Notifications fetched successfully"
    )
  );
});

// Mark single notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: req.user._id });
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

// Mark all notifications as read for current user
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// Helper function to create standard notifications
export const createNotificationHelper = async (userId, title, message) => {
  try {
    return await Notification.create({
      user: userId,
      title,
      message
    });
  } catch (error) {
    console.error("Failed creating notification: ", error);
    return null;
  }
};
