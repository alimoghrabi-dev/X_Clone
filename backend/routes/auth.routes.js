import { Router } from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const authRouter = Router();

authRouter.get("/current-user", protectRoute, getCurrentUser);
authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

export default authRouter;
