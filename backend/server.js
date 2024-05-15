import express from "express";
import authRouter from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectToMongoDB from "./database/connection.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);

  connectToMongoDB();
});

app.use("/api/auth", authRouter);
