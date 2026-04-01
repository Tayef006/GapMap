const express = require("express");
const router = express.Router();

const {
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getEntriesByDay,
} = require("../controllers/timetableController");

// Get all timetable entries
router.get("/", getAllTimetableEntries);

// Get timetable entries for a specific day
router.get("/day/:day", getEntriesByDay);

// Get one timetable entry by ID
router.get("/:id", getTimetableEntryById);

// Create a new timetable entry
router.post("/", createTimetableEntry);

// Update a timetable entry
router.put("/:id", updateTimetableEntry);

// Delete a timetable entry
router.delete("/:id", deleteTimetableEntry);

module.exports = router;