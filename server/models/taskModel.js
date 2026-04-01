const { db } = require("../db/database");

function getAllTasks(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM tasks
      WHERE user_id = ?
      ORDER BY
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        CASE status
          WHEN 'pending' THEN 1
          WHEN 'completed' THEN 2
        END,
        deadline ASC,
        created_at DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function getTaskById(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM tasks
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

function createTask(taskData) {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      title,
      description = null,
      estimated_duration,
      priority = "medium",
      energy_level = "medium",
      deadline = null,
      status = "pending",
    } = taskData;

    const sql = `
      INSERT INTO tasks (
        user_id,
        title,
        description,
        estimated_duration,
        priority,
        energy_level,
        deadline,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        user_id,
        title,
        description,
        estimated_duration,
        priority,
        energy_level,
        deadline,
        status,
      ],
      function (err) {
        if (err) {
          return reject(err);
        }

        getTaskById(this.lastID, user_id)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

function updateTask(id, userId, taskData) {
  return new Promise((resolve, reject) => {
    const {
      title,
      description = null,
      estimated_duration,
      priority = "medium",
      energy_level = "medium",
      deadline = null,
      status = "pending",
    } = taskData;

    const sql = `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        estimated_duration = ?,
        priority = ?,
        energy_level = ?,
        deadline = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    db.run(
      sql,
      [
        title,
        description,
        estimated_duration,
        priority,
        energy_level,
        deadline,
        status,
        id,
        userId,
      ],
      function (err) {
        if (err) {
          return reject(err);
        }

        if (this.changes === 0) {
          return resolve(null);
        }

        getTaskById(id, userId)
          .then(resolve)
          .catch(reject);
      }
    );
  });
}

function updateTaskStatus(id, userId, status) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tasks
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    db.run(sql, [status, id, userId], function (err) {
      if (err) {
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(null);
      }

      getTaskById(id, userId)
        .then(resolve)
        .catch(reject);
    });
  });
}

function deleteTask(id, userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM tasks
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

function getPendingTasks(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM tasks
      WHERE user_id = ? AND status = 'pending'
      ORDER BY
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        deadline ASC,
        estimated_duration ASC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
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