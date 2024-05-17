import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcyrptjs from "bcryptjs";

export const signupUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json("Invalid Email!");
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json("User already exists!");
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json("Email already exists!");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json("Password must be at least 6 characters long!");
    }

    const salt = await bcyrptjs.genSalt(10);
    const hashedPassword = await bcyrptjs.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      return res.status(400).json("Invalid user data.");
    }
  } catch (error) {
    console.log(error, "Signup User");
    return res.status(500).json("Internal server error!");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json("User not found!");
    }

    const isPasswordCorrect = await bcyrptjs.compare(
      password,
      user?.password || ""
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Invalid credentials!");
    }

    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log(error, "Login User");
    return res.status(500).json("Internal server error!");
  }
};

export const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ success: true, message: "Successfully logged out!" });
  } catch (error) {
    console.log(error, "Logout User");
    return res.status(500).json("Internal server error!");
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log(error, "Get Authenticated User");
    return res.status(500).json("Internal server error!");
  }
};
