import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      receiver: userId,
    }).populate({
      path: "sender",
      select: "username profileImage",
    });

    await Notification.updateMany(
      {
        receiver: userId,
      },
      {
        read: true,
      }
    );

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error, "Get Notifications");
    return res.status(500).json("Internal server error");
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ receiver: userId });

    return res.status(200).json("Notifications deleted successfully");
  } catch (error) {
    console.log(error, "Delete Notifications");
    return res.status(500).json("Internal server error");
  }
};
