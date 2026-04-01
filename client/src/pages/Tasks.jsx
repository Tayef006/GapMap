import React, { useEffect, useState } from "react";
import { getTasks, updateTaskStatus, deleteTask } from "../services/api";
import TaskForm from "../components/TaskForm";
import {
  formatMinutes,
  formatPriority,
  formatEnergyLevel,
  formatStatus,
} from "../utils";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");
      const data = await getTasks(1);
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleTaskCreated() {
    await fetchTasks();
  }

  async function handleMarkComplete(taskId) {
    try {
      await updateTaskStatus(taskId, "completed", 1);
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to update task status");
    }
  }

  async function handleMarkPending(taskId) {
    try {
      await updateTaskStatus(taskId, "pending", 1);
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to update task status");
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId, 1);
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  }

  return (
    <div className="page-stack">
      <TaskForm onTaskCreated={handleTaskCreated} />

      <section className="page-card">
        <h2>Your Tasks</h2>
        <p>Manage your tasks here.</p>

        {loading && <p>Loading tasks...</p>}

        {error && <p className="message error-message">{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <p>No tasks found yet.</p>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="list-container">
            {tasks.map((task) => (
              <div key={task.id} className="list-item">
                <h3>{task.title}</h3>

                {task.description && <p>{task.description}</p>}

                <p>
                  <strong>Duration:</strong> {formatMinutes(task.estimated_duration)}
                </p>
                <p>
                  <strong>Priority:</strong> {formatPriority(task.priority)}
                </p>
                <p>
                  <strong>Energy Level:</strong> {formatEnergyLevel(task.energy_level)}
                </p>
                <p>
                  <strong>Status:</strong> {formatStatus(task.status)}
                </p>
                {task.deadline && (
                  <p>
                    <strong>Deadline:</strong> {task.deadline}
                  </p>
                )}

                <div className="action-row">
                  {task.status === "pending" ? (
                    <button
                      className="submit-button"
                      onClick={() => handleMarkComplete(task.id)}
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      onClick={() => handleMarkPending(task.id)}
                    >
                      Mark Pending
                    </button>
                  )}

                  <button
                    className="danger-button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Tasks;