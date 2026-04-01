import React from "react";
import { formatMinutes, formatTimeRange, formatGapCategory } from "../utils";

function GapCard({ gap }) {
  if (!gap) {
    return null;
  }

  return (
    <div className="gap-card">
      <h3>Free Time Gap</h3>

      <p>
        <strong>Day:</strong> {gap.day_of_week}
      </p>

      <p>
        <strong>Time:</strong> {formatTimeRange(gap.start_time, gap.end_time)}
      </p>

      <p>
        <strong>Duration:</strong> {formatMinutes(gap.duration_minutes)}
      </p>

<p>
  <strong>Category:</strong> {formatGapCategory(gap.category)}
</p>

      {gap.before_entry && (
        <p>
          <strong>After:</strong> {gap.before_entry}
        </p>
      )}

      {gap.after_entry && (
        <p>
          <strong>Before:</strong> {gap.after_entry}
        </p>
      )}
    </div>
  );
}

export default GapCard;