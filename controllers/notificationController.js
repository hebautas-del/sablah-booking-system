
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// GET MY NOTIFICATIONS
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
      .populate("booking", "bookingDate status guests totalPrice")
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);

  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      message: "Failed to retrieve notifications."
    });
  }
};


// MARK ONE NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID."
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: req.user.id
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      message: "Notification marked as read.",
      notification
    });

  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    return res.status(500).json({
      message: "Failed to update notification."
    });
  }
};


// MARK ALL NOTIFICATIONS AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read."
    });

  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);

    return res.status(500).json({
      message: "Failed to update notifications."
    });
  }
};


// DELETE ONE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid notification ID."
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully."
    });

  } catch (error) {
    console.error("Delete Notification Error:", error);

    return res.status(500).json({
      message: "Failed to delete notification."
    });
  }
};
