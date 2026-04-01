const taskModel = require("../models/taskModel");

function isValidPriority(priority) {
  const validPriorities = ["low", "medium", "high"];
  return validPriorities.includes(priority);
}

function isValidEnergyLevel(energyLevel) {
  const validEnergyLevels = ["low", "medium", "high"];
  return validEnergyLevels.includes(energyLevel);
}

function isValidStatus(status) {
  const validStatuses = ["pending", "completed"];
  return validStatuses.includes(status);
}

function isValidDeadline(deadline) {
  if (!deadline) return true;

  const date = new Date(deadline);
  return !Number.isNaN(date.getTime());
}

function isDeadlineTodayOrLater(deadline) {
  if (!deadline) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  return deadlineDate >= today;
}

// Temporary helper until proper authentication is added
function getUserId(req) {
  return Number(req.body?.user_id || req.query?.user_id || 1);
}

async function getAllTasks(req, res) {
  try {
    const userId = getUserId(req);
    const tasks = await taskModel.getAllTasks(userId);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

async function getTaskById(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const task = await taskModel.getTaskById(id, userId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res.status(500).json({ error: "Failed to fetch task" });
  }
}

async function createTask(req, res) {
  try {
    const userId = getUserId(req);
    const {
      title,
      description,
      estimated_duration,
      priority = "medium",
      energy_level = "medium",
      deadline = null,
      status = "pending",
    } = req.body;

    if (!title || !estimated_duration) {
      return res.status(400).json({
        error: "title and estimated_duration are required",
      });
    }

    const parsedDuration = Number(estimated_duration);

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 480) {
      return res.status(400).json({
        error: "estimated_duration must be a whole number between 1 and 480",
      });
    }

    if (!isValidPriority(priority)) {
      return res.status(400).json({
        error: "Invalid priority value",
      });
    }

    if (!isValidEnergyLevel(energy_level)) {
      return res.status(400).json({
        error: "Invalid energy_level value",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        error: "Invalid status value",
      });
    }

    if (!isValidDeadline(deadline)) {
      return res.status(400).json({
        error: "Invalid deadline value",
      });
    }

    if (!isDeadlineTodayOrLater(deadline)) {
      return res.status(400).json({
        error: "Deadline cannot be earlier than today",
      });
    }

    const newTask = await taskModel.createTask({
      user_id: userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      estimated_duration: parsedDuration,
      priority,
      energy_level,
      deadline,
      status,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
}

async function updateTask(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const {
      title,
      description,
      estimated_duration,
      priority = "medium",
      energy_level = "medium",
      deadline = null,
      status = "pending",
    } = req.body;

    if (!title || !estimated_duration) {
      return res.status(400).json({
        error: "title and estimated_duration are required",
      });
    }

    const parsedDuration = Number(estimated_duration);

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0 || parsedDuration > 480) {
      return res.status(400).json({
        error: "estimated_duration must be a whole number between 1 and 480",
      });
    }

    if (!isValidPriority(priority)) {
      return res.status(400).json({
        error: "Invalid priority value",
      });
    }

    if (!isValidEnergyLevel(energy_level)) {
      return res.status(400).json({
        error: "Invalid energy_level value",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        error: "Invalid status value",
      });
    }

    if (!isValidDeadline(deadline)) {
      return res.status(400).json({
        error: "Invalid deadline value",
      });
    }

    if (!isDeadlineTodayOrLater(deadline)) {
      return res.status(400).json({
        error: "Deadline cannot be earlier than today",
      });
    }

    const updatedTask = await taskModel.updateTask(id, userId, {
      title: title.trim(),
      description: description ? description.trim() : null,
      estimated_duration: parsedDuration,
      priority,
      energy_level,
      deadline,
      status,
    });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ error: "Failed to update task" });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedTask = await taskModel.updateTaskStatus(id, userId, status);

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error.message);
    res.status(500).json({ error: "Failed to update task status" });
  }
}

async function deleteTask(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const result = await taskModel.deleteTask(id, userId);

    if (!result.deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
}

async function getPendingTasks(req, res) {
  try {
    const userId = getUserId(req);
    const tasks = await taskModel.getPendingTasks(userId);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching pending tasks:", error.message);
    res.status(500).json({ error: "Failed to fetch pending tasks" });
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getPendingTasks,
};