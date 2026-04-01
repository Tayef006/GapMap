const { db } = require("../db/database");

function getAllTimetableEntries(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM timetable_entries
      WHERE user_id = ?
      ORDER BY
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        start_time ASC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function getTimetableEntryById(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM timetable_entries
      WHERE id = ? AND user_id = ?
    `;

    db.get(sql, [id, userId], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

function createTimetableEntry(entryData) {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      title,
      day_of_week,
      start_time,
      end_time,
      location = null,
      entry_type = "class",
    } = entryData;

    const sql = `
      INSERT INTO timetable_entries (
        user_id,
        title,
        day_of_week,
        start_time,
        end_time,
        location,
        entry_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [user_id, title, day_of_week, start_time, end_time, location, entry_type],
      function (err) {
        if (err) {
          return reject(err);
        }

        getTimetableEntryById(this.lastID, user_id)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

function updateTimetableEntry(id, userId, entryData) {
  return new Promise((resolve, reject) => {
    const {
      title,
      day_of_week,
      start_time,
      end_time,
      location = null,
      entry_type = "class",
    } = entryData;

    const sql = `
      UPDATE timetable_entries
      SET
        title = ?,
        day_of_week = ?,
        start_time = ?,
        end_time = ?,
        location = ?,
        entry_type = ?
      WHERE id = ? AND user_id = ?
    `;

    db.run(
      sql,
      [title, day_of_week, start_time, end_time, location, entry_type, id, userId],
      function (err) {
        if (err) {
          return reject(err);
        }

        if (this.changes === 0) {
          return resolve(null);
        }

        getTimetableEntryById(id, userId)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

function deleteTimetableEntry(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM timetable_entries
      WHERE id = ? AND user_id = ?
    `;

    db.run(sql, [id, userId], function (err) {
      if (err) {
        return reject(err);
      }

      resolve({
        deleted: this.changes > 0,
      });
    });
  });
}

function getEntriesByDay(userId, dayOfWeek) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM timetable_entries
      WHERE user_id = ? AND day_of_week = ?
      ORDER BY start_time ASC
    `;

    db.all(sql, [userId, dayOfWeek], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

module.exports = {
  getAllTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getEntriesByDay,
};