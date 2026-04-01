import React from "react";
import {
  formatMinutes,
  formatPriority,
  formatEnergyLevel,
  formatStatus,
} from "../utils";

function RecommendationCard({ recommendation, alternatives = [], message }) {
  if (!recommendation) {
    return (
      <div className="recommendation-card">
        <h3>Suggested Task</h3>
        <p>{message || "No suitable recommendation found for this gap."}</p>
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      <h3>Suggested Task</h3>

      <p>
        <strong>Title:</strong> {recommendation.title}
      </p>

      {recommendation.description && (
        <p>
          <strong>Description:</strong> {recommendation.description}
        </p>
      )}

      <p>
        <strong>Estimated Duration:</strong> {formatMinutes(recommendation.estimated_duration)}
      </p>

      <p>
        <strong>Priority:</strong> {formatPriority(recommendation.priority)}
      </p>

      <p>
        <strong>Energy Level:</strong> {formatEnergyLevel(recommendation.energy_level)}
      </p>

      <p>
        <strong>Status:</strong> {formatStatus(recommendation.status)}
      </p>

      {recommendation.deadline && (
        <p>
          <strong>Deadline:</strong> {recommendation.deadline}
        </p>
      )}

      <p>
        <strong>Why this was suggested:</strong> {recommendation.reason}
      </p>

      <p>
        <strong>Match Score:</strong> {recommendation.score}
      </p>

      {alternatives.length > 0 && (
        <div className="alternatives-box">
          <h4>Other possible tasks</h4>
          {alternatives.map((task) => (
            <div key={task.id} className="alternative-item">
              <p>
                <strong>{task.title}</strong>
              </p>
              <p>Duration: {formatMinutes(task.estimated_duration)}</p>
              <p>Priority: {formatPriority(task.priority)}</p>
              <p>Energy: {formatEnergyLevel(task.energy_level)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendationCard;