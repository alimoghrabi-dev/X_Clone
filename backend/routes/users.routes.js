import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.get("/profile/:id", protectRoute, getUserProfile);
usersRouter.get("/suggested", protectRoute, getSuggestedUsers);
usersRouter.post("/follow-user/:id", protectRoute, followUnfollowUser);
usersRouter.post("/update-profile", protectRoute, updateUserProfile);

export default usersRouter;
