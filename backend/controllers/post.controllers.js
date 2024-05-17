import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { image } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    if (!text && !image) {
      return res.status(400).json("Please add text or image");
    }

    if (image) {
      const uploadedRes = await cloudinary.uploader.upload(image);
      image = uploadedRes.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      image,
    });

    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error) {
    console.log(error, "Create Post");
    return res.status(500).json("Internal server error");
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // unlike the post:
      await Post.updateOne(
        { _id: postId },
        {
          $pull: {
            likes: userId,
          },
        }
      );

      return res.status(200).json("Post unliked successfully");
    } else {
      // like the post:
      await Post.updateOne(
        { _id: postId },
        {
          $push: {
            likes: userId,
          },
        }
      );

      // send notification:
      const notification = new Notification({
        sender: userId,
        receiver: post.user,
        type: "like",
      });

      await notification.save();

      return res.status(200).json("Post liked successfully");
    }
  } catch (error) {
    console.log(error, "Like/Unlike Post");
    return res.status(500).json("Internal server error");
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json("Please add text");
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    const comment = {
      text,
      userId,
    };

    post.comments.push(comment);

    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.log(error, "Comment On Post");
    return res.status(500).json("Internal server error");
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json("Action not allowed");
    }

    if (post.image) {
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json("Post deleted successfully");
  } catch (error) {
    console.log(error, "Delete Post");
    return res.status(500).json("Internal server error");
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.userId",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error, "Get All Posts");
    return res.status(500).json("Internal server error");
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const posts = await Post.find({})
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.userId",
        select: "-password",
      });

    const likedPosts = posts.filter((post) => {
      return post.likes.includes(userId);
    });

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error, "Get Liked Posts");
    return res.status(500).json("Internal server error");
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.userId",
        select: "-password",
      });

    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log(error, "Get Following Posts");
    return res.status(500).json("Internal server error");
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const posts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.userId",
        select: "-password",
      });

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error, "Get User Posts");
    return res.status(500).json("Internal server error");
  }
};
