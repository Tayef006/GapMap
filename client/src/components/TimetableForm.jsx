import React, { useState } from "react";
import { createTimetableEntry } from "../services/api";

function TimetableForm({ onEntryCreated }) {
  const [formData, setFormData] = useState({
    user_id: 1,
    title: "",
    day_of_week: "Monday",
    start_time: "",
    end_time: "",
    location: "",
    entry_type: "lecture",
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

    if (!formData.title || !formData.start_time || !formData.end_time) {
      setError("Please fill in title, start time, and end time.");
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError("Start time must be earlier than end time.");
      return;
    }

    try {
      setLoading(true);

      const newEntry = await createTimetableEntry({
        ...formData,
        title: formData.title.trim(),
        location: formData.location.trim(),
      });

      setSuccessMessage("Timetable entry added successfully.");

      setFormData({
        user_id: 1,
        title: "",
        day_of_week: "Monday",
        start_time: "",
        end_time: "",
        location: "",
        entry_type: "lecture",
      });

      if (onEntryCreated) {
        onEntryCreated(newEntry);
      }
    } catch (err) {
      setError(err.message || "Failed to create timetable entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card">
      <h2>Add Timetable Entry</h2>
      <p>Add a class, lab, seminar, work shift, or study session.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Algorithms Lecture"
          />
        </div>

        <div className="form-group">
          <label htmlFor="day_of_week">Day</label>
          <select
            id="day_of_week"
            name="day_of_week"
            value={formData.day_of_week}
            onChange={handleChange}
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_time">Start Time</label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">End Time</label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Room A1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="entry_type">Entry Type</label>
          <select
            id="entry_type"
            name="entry_type"
            value={formData.entry_type}
            onChange={handleChange}
          >
            <option value="class">Class</option>
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
            <option value="seminar">Seminar</option>
            <option value="study">Study</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && <p className="message error-message">{error}</p>}
        {successMessage && (
          <p className="message success-message">{successMessage}</p>
        )}

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Entry"}
        </button>
      </form>
    </section>
  );
}

export default TimetableForm;