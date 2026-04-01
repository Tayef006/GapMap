import React, { useEffect, useState } from "react";
import {
  getTimetableEntries,
  getTasks,
  getPendingTasks,
  getRecommendations,
} from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    timetableCount: 0,
    taskCount: 0,
    pendingTaskCount: 0,
    recommendationCount: 0,
  });

  const [topRecommendation, setTopRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [timetableData, tasksData, pendingTasksData, recommendationData] =
        await Promise.all([
          getTimetableEntries(1),
          getTasks(1),
          getPendingTasks(1),
          getRecommendations(1),
        ]);

      const recommendations = recommendationData.recommendations || [];
      const firstUsefulRecommendation = recommendations.find(
        (item) => item.recommendation
      );

      setStats({
        timetableCount: timetableData.length,
        taskCount: tasksData.length,
        pendingTaskCount: pendingTasksData.length,
        recommendationCount: recommendations.length,
      });

      setTopRecommendation(firstUsefulRecommendation || null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="page-stack">
      <section className="page-card">
        <h2>Dashboard</h2>
        <p>Your quick overview of timetable activity, tasks, and suggestions.</p>

        {loading && <p>Loading dashboard...</p>}
        {error && <p className="message error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-stat-card">
                <h3>Timetable Entries</h3>
                <p className="stat-number">{stats.timetableCount}</p>
              </div>

              <div className="dashboard-stat-card">
                <h3>Total Tasks</h3>
                <p className="stat-number">{stats.taskCount}</p>
              </div>

              <div className="dashboard-stat-card">
                <h3>Pending Tasks</h3>
                <p className="stat-number">{stats.pendingTaskCount}</p>
              </div>

              <div className="dashboard-stat-card">
                <h3>Gaps Found</h3>
                <p className="stat-number">{stats.recommendationCount}</p>
              </div>
            </div>
          </>
        )}
      </section>

      {!loading && !error && (
        <section className="page-card">
          <h2>Best Current Suggestion</h2>

          {!topRecommendation && (
            <p>
              No recommendation available yet. Add timetable entries and tasks
              first.
            </p>
          )}

          {topRecommendation && (
            <div className="recommendation-preview">
              <p>
                <strong>Day:</strong> {topRecommendation.gap.day_of_week}
              </p>
              <p>
                <strong>Gap:</strong> {topRecommendation.gap.start_time} -{" "}
                {topRecommendation.gap.end_time}
              </p>
              <p>
                <strong>Suggested Task:</strong>{" "}
                {topRecommendation.recommendation.title}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {topRecommendation.recommendation.estimated_duration} minutes
              </p>
              <p>
                <strong>Priority:</strong>{" "}
                {topRecommendation.recommendation.priority}
              </p>
              <p>
                <strong>Reason:</strong>{" "}
                {topRecommendation.recommendation.reason}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;