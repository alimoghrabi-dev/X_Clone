import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json("User not found");
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error, "Get Authenticated User");
    return res.status(500).json("Internal server error");
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json("You cannot follow/unfollow yourself");
    }

    if (!userToModify || !currentUser) {
      return res.status(404).json("User not found");
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user:
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { followers: req.user._id },
      });

      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });

      return res.status(200).json("User unfollowed successfully");
    } else {
      // Follow the user and send notification:
      await User.findByIdAndUpdate(userToModify._id, {
        $push: { followers: req.user._id },
      });

      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });

      const newNotification = new Notification({
        sender: req.user._id,
        receiver: userToModify._id,
        type: "follow",
      });

      await newNotification.save();

      return res.status(200).json("User followed successfully");
    }
  } catch (error) {
    console.log(error, "Follow Unfollow User");
    return res.status(500).json("Internal server error");
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByUser = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByUser.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error, "Get Suggested Users");
    return res.status(500).json("Internal server error");
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profilePicture, coverImage } = req.body;

    const userId = req.user._id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json("Please provide both current and new password");
    }

    if (newPassword && currentPassword) {
      const isMatch = await bcryptjs.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json("Incorrect current password");
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json("Password must be at least 6 characters long");
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      user.password = hashedPassword;
    }

    if (profilePicture) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }

      const uploadedRes = await cloudinary.uploader.upload(profilePicture);
      profilePicture = uploadedRes.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(
          user.coverImage.split("/").pop().split(".")[0]
        );
      }

      const uploadedRes = await cloudinary.uploader.upload(coverImage);
      coverImage = uploadedRes.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImage = profilePicture || user.profileImage;
    user.coverImage = coverImage || user.coverImage;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log(error, "Update User Profile");
    return res.status(500).json("Internal server error");
  }
};
