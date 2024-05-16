import express from "express";
import authRouter from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectToMongoDB from "./database/connection.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);

  connectToMongoDB();
});
