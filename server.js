import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import connectDb from "./config/db.js";
import dotenv from "dotenv";

import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
const app = express();
// connect db
connectDb();
dotenv.config();
// es module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware

app.use(express.json());
app.use(morgan("dev"));

// app.use(express.static(path.join(__dirname, "./client/build")));

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, "./client/build")));

// Routes
app.use("/api/auth", authRoutes);

// rest api
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
// Define port
const PORT = process.env.PORT || 7000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
