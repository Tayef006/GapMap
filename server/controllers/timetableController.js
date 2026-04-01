const timetableModel = require("../models/timetableModel");

function isValidTimeFormat(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function isValidDay(day) {
  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return validDays.includes(day);
}

function isValidEntryType(type) {
  const validTypes = [
    "class",
    "lab",
    "lecture",
    "seminar",
    "study",
    "work",
    "other",
  ];

  return validTypes.includes(type);
}

// Temporary helper until proper authentication is added
function getUserId(req) {
  return Number(req.body?.user_id || req.query?.user_id || 1);
}

async function getAllTimetableEntries(req, res) {
  try {
    const userId = getUserId(req);

    const entries = await timetableModel.getAllTimetableEntries(userId);

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching timetable entries:", error.message);
    res.status(500).json({ error: "Failed to fetch timetable entries" });
  }
}

async function getTimetableEntryById(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const entry = await timetableModel.getTimetableEntryById(id, userId);

    if (!entry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching timetable entry:", error.message);
    res.status(500).json({ error: "Failed to fetch timetable entry" });
  }
}

async function createTimetableEntry(req, res) {
  try {
    const userId = getUserId(req);
    const {
      title,
      day_of_week,
      start_time,
      end_time,
      location,
      entry_type = "class",
    } = req.body;

    if (!title || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        error: "title, day_of_week, start_time, and end_time are required",
      });
    }

    if (!isValidDay(day_of_week)) {
      return res.status(400).json({
        error: "Invalid day_of_week value",
      });
    }

    if (!isValidTimeFormat(start_time) || !isValidTimeFormat(end_time)) {
      return res.status(400).json({
        error: "Time must be in HH:MM format",
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        error: "start_time must be earlier than end_time",
      });
    }

    if (!isValidEntryType(entry_type)) {
      return res.status(400).json({
        error: "Invalid entry_type value",
      });
    }

    const newEntry = await timetableModel.createTimetableEntry({
      user_id: userId,
      title: title.trim(),
      day_of_week,
      start_time,
      end_time,
      location: location ? location.trim() : null,
      entry_type,
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating timetable entry:", error.message);
    res.status(500).json({ error: "Failed to create timetable entry" });
  }
}

async function updateTimetableEntry(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const {
      title,
      day_of_week,
      start_time,
      end_time,
      location,
      entry_type = "class",
    } = req.body;

    if (!title || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        error: "title, day_of_week, start_time, and end_time are required",
      });
    }

    if (!isValidDay(day_of_week)) {
      return res.status(400).json({
        error: "Invalid day_of_week value",
      });
    }

    if (!isValidTimeFormat(start_time) || !isValidTimeFormat(end_time)) {
      return res.status(400).json({
        error: "Time must be in HH:MM format",
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        error: "start_time must be earlier than end_time",
      });
    }

    if (!isValidEntryType(entry_type)) {
      return res.status(400).json({
        error: "Invalid entry_type value",
      });
    }

    const updatedEntry = await timetableModel.updateTimetableEntry(id, userId, {
      title: title.trim(),
      day_of_week,
      start_time,
      end_time,
      location: location ? location.trim() : null,
      entry_type,
    });

    if (!updatedEntry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating timetable entry:", error.message);
    res.status(500).json({ error: "Failed to update timetable entry" });
  }
}

async function deleteTimetableEntry(req, res) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);

    const result = await timetableModel.deleteTimetableEntry(id, userId);

    if (!result.deleted) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    res.status(200).json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting timetable entry:", error.message);
    res.status(500).json({ error: "Failed to delete timetable entry" });
  }
}

async function getEntriesByDay(req, res) {
  try {
    const userId = getUserId(req);
    const { day } = req.params;

    if (!isValidDay(day)) {
      return res.status(400).json({ error: "Invalid day value" });
    }

    const entries = await timetableModel.getEntriesByDay(userId, day);

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching timetable entries by day:", error.message);
    res.status(500).json({ error: "Failed to fetch timetable entries by day" });
  }
}

module.exports = {
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getEntriesByDay,
};