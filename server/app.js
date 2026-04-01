const express = require("express");
const cors = require("cors");

const timetableRoutes = require("./routes/timetableRoutes");
const taskRoutes = require("./routes/taskRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "GapMap API is running",
  });
});

// API routes
app.use("/api/timetable", timetableRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/recommendations", recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Something went wrong on the server",
  });
});

module.exports = app;