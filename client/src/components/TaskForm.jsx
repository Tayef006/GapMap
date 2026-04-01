import React, { useState } from "react";
import { createTask } from "../services/api";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TaskForm({ onTaskCreated }) {
  const [formData, setFormData] = useState({
    user_id: 1,
    title: "",
    description: "",
    estimated_duration: "",
    priority: "medium",
    energy_level: "medium",
    deadline: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.title || !formData.estimated_duration) {
      setError("Please fill in title and estimated duration.");
      return;
    }

    const duration = Number(formData.estimated_duration);

    if (!Number.isInteger(duration) || duration <= 0 || duration > 480) {
      setError("Estimated duration must be a whole number between 1 and 480.");
      return;
    }

    const today = getTodayDateString();

    if (formData.deadline && formData.deadline < today) {
      setError("Deadline cannot be earlier than today.");
      return;
    }

    try {
      setLoading(true);

      const newTask = await createTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimated_duration: duration,
        deadline: formData.deadline || null,
      });

      setSuccessMessage("Task added successfully.");

      setFormData({
        user_id: 1,
        title: "",
        description: "",
        estimated_duration: "",
        priority: "medium",
        energy_level: "medium",
        deadline: "",
        status: "pending",
      });

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
    } catch (err) {
      setError(err.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card">
      <h2>Add Task</h2>
      <p>Add a task that GapMap can suggest during free timetable gaps.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Revise sorting notes"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional details about the task"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimated_duration">Estimated Duration (minutes)</label>
          <input
            id="estimated_duration"
            name="estimated_duration"
            type="number"
            min="1"
            max="480"
            value={formData.estimated_duration}
            onChange={handleChange}
            placeholder="e.g. 30"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="energy_level">Energy Level</label>
            <select
              id="energy_level"
              name="energy_level"
              value={formData.energy_level}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            min={getTodayDateString()}
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>

        {error && <p className="message error-message">{error}</p>}
        {successMessage && (
          <p className="message success-message">{successMessage}</p>
        )}

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>
    </section>
  );
}

export default TaskForm;