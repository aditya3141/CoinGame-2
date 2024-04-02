// Import necessary modules
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; // Importing your authentication routes
import connectDb from "./config/db.js"; // Importing database connection function
import dotenv from "dotenv"; // For loading environment variables
import path from "path"; // For working with file paths
import morgan from "morgan"; // For logging HTTP requests
import { fileURLToPath } from "url"; // For handling file URLs

// Create an instance of Express
const app = express();

// Connect to the database
connectDb();

// Load environment variables from .env file
dotenv.config();

// Fix for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, "./client/build"))); // Serve static files from client/build directory
app.use(morgan("dev")); // Log HTTP requests

// Enable CORS for specific origin and methods
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Routes
app.use("/api/auth", authRoutes); // Mount authentication routes under /api/auth

// Fallback route to serve the React app
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Define port
const PORT = process.env.PORT || 7000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express app (for testing purposes or potential future modifications)
export default app;
