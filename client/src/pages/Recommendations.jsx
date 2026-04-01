import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";
import GapCard from "../components/GapCard";
import RecommendationCard from "../components/RecommendationCard";

const DEFAULT_DAY_WINDOW = {
  dayStart: "08:00",
  dayEnd: "18:00",
};

function Recommendations() {
  const [recommendationData, setRecommendationData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dayWindow, setDayWindow] = useState(() => {
    const savedWindow = localStorage.getItem("gapmapDayWindow");

    if (!savedWindow) {
      return DEFAULT_DAY_WINDOW;
    }

    try {
      const parsedWindow = JSON.parse(savedWindow);

      if (
        parsedWindow.dayStart &&
        parsedWindow.dayEnd &&
        parsedWindow.dayStart < parsedWindow.dayEnd
      ) {
        return parsedWindow;
      }
    } catch (err) {
      console.error("Failed to parse saved day window:", err);
    }

    return DEFAULT_DAY_WINDOW;
  });

  async function fetchRecommendations(customWindow = dayWindow) {
    try {
      setLoading(true);
      setError("");

      const data = await getRecommendations(1, {
        dayStart: customWindow.dayStart,
        dayEnd: customWindow.dayEnd,
      });

      setRecommendationData(data.recommendations || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecommendations(dayWindow);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setDayWindow((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleApplyWindow(event) {
    event.preventDefault();

    if (dayWindow.dayStart >= dayWindow.dayEnd) {
      setError("Active day start must be earlier than active day end.");
      return;
    }

    localStorage.setItem("gapmapDayWindow", JSON.stringify(dayWindow));
    await fetchRecommendations(dayWindow);
  }

  function handleResetWindow() {
    localStorage.setItem("gapmapDayWindow", JSON.stringify(DEFAULT_DAY_WINDOW));
    setDayWindow(DEFAULT_DAY_WINDOW);
    fetchRecommendations(DEFAULT_DAY_WINDOW);
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <h2>Recommendations</h2>
        <p>
          GapMap suggests tasks that best fit the real free gaps between your
          sessions.
        </p>

        <form className="form" onSubmit={handleApplyWindow}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dayStart">Active Day Start</label>
              <input
                id="dayStart"
                name="dayStart"
                type="time"
                value={dayWindow.dayStart}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dayEnd">Active Day End</label>
              <input
                id="dayEnd"
                name="dayEnd"
                type="time"
                value={dayWindow.dayEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="action-row">
            <button className="submit-button" type="submit">
              Apply Day Window
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={handleResetWindow}
            >
              Reset Default
            </button>
          </div>
        </form>

        {loading && <p>Loading recommendations...</p>}
        {error && <p className="message error-message">{error}</p>}

        {!loading && !error && summary && (
          <div className="summary-box">
            <p>
              <strong>Total Real Gaps Found:</strong> {summary.total_gaps}
            </p>
            <p>
              <strong>Pending Tasks:</strong> {summary.total_pending_tasks}
            </p>
            <p>
              <strong>Status:</strong> {summary.message}
            </p>
          </div>
        )}

        {!loading && !error && recommendationData.length === 0 && (
          <p>No real gaps found between sessions for this day window.</p>
        )}
      </section>

      {!loading &&
        !error &&
        recommendationData.length > 0 &&
        recommendationData.map((item, index) => (
          <section key={index} className="page-card">
            <GapCard gap={item.gap} />
            <RecommendationCard
              recommendation={item.recommendation}
              alternatives={item.alternatives}
              message={item.message}
            />
          </section>
        ))}
    </div>
  );
}

export default Recommendations;