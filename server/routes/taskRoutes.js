const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getPendingTasks,
} = require("../controllers/taskController");

// Get all tasks
router.get("/", getAllTasks);

// Get pending tasks
router.get("/pending", getPendingTasks);

// Get one task by ID
router.get("/:id", getTaskById);

// Create a new task
router.post("/", createTask);

// Update a full task
router.put("/:id", updateTask);

// Update only task status
router.patch("/:id/status", updateTaskStatus);

// Delete a task
router.delete("/:id", deleteTask);

module.exports = router;