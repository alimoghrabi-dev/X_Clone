import { Router } from "express";
import { signupUser } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login");
authRouter.post("/logout");

export default authRouter;
