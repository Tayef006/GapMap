import React, { useEffect, useState } from "react";
import { getTimetableEntries, deleteTimetableEntry } from "../services/api";
import TimetableForm from "../components/TimetableForm";
import { formatTimeRange, capitalise } from "../utils";

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEntries() {
    try {
      setLoading(true);
      setError("");
      const data = await getTimetableEntries(1);
      setEntries(data);
    } catch (err) {
      setError(err.message || "Failed to load timetable entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  async function handleEntryCreated() {
    await fetchEntries();
  }

  async function handleDeleteEntry(entryId) {
    try {
      setError("");
      await deleteTimetableEntry(entryId, 1);
      await fetchEntries();
    } catch (err) {
      setError(err.message || "Failed to delete timetable entry");
    }
  }

  return (
    <div className="page-stack">
      <TimetableForm onEntryCreated={handleEntryCreated} />

      <section className="page-card">
        <h2>Your Timetable</h2>
        <p>View your scheduled classes and events here.</p>

        {loading && <p>Loading timetable entries...</p>}
        {error && <p className="message error-message">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p>No timetable entries found yet.</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="list-container">
            {entries.map((entry) => (
              <div key={entry.id} className="list-item">
                <h3>{entry.title}</h3>
                <p>
                  <strong>Day:</strong> {entry.day_of_week}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTimeRange(entry.start_time, entry.end_time)}
                </p>
                <p>
                  <strong>Type:</strong> {capitalise(entry.entry_type)}
                </p>
                {entry.location && (
                  <p>
                    <strong>Location:</strong> {entry.location}
                  </p>
                )}

                <div className="action-row">
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteEntry(entry.id)}
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

export default Timetable;