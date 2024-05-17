import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controllers.js";

const postRouter = Router();

postRouter.get("/get-all", protectRoute, getAllPosts);
postRouter.get("/liked-posts/:id", protectRoute, getLikedPosts);
postRouter.get("/following-posts", protectRoute, getFollowingPosts);
postRouter.get("/user-posts/:username", protectRoute, getUserPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.post("/like-unlike/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, commentOnPost);
postRouter.delete("/delete", protectRoute, deletePost);

export default postRouter;
