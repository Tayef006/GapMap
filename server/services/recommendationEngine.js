const timetableModel = require("../models/timetableModel");
const taskModel = require("../models/taskModel");

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getGapCategory(duration) {
  if (duration < 15) return "too-short";
  if (duration <= 30) return "micro";
  if (duration <= 60) return "short";
  if (duration <= 120) return "medium";
  return "long";
}

function inferGapEnergyLevel(startTime) {
  const hour = Number(startTime.split(":")[0]);

  if (hour >= 8 && hour < 12) return "high";
  if (hour >= 12 && hour < 17) return "medium";
  return "low";
}

function getPriorityScore(priority) {
  switch (priority) {
    case "high":
      return 30;
    case "medium":
      return 20;
    case "low":
      return 10;
    default:
      return 0;
  }
}

function getEnergyScore(taskEnergy, gapEnergy) {
  if (taskEnergy === gapEnergy) return 20;

  if (
    (taskEnergy === "high" && gapEnergy === "medium") ||
    (taskEnergy === "medium" && gapEnergy === "high") ||
    (taskEnergy === "medium" && gapEnergy === "low") ||
    (taskEnergy === "low" && gapEnergy === "medium")
  ) {
    return 10;
  }

  return 0;
}

function getDeadlineScore(deadline) {
  if (!deadline) return 0;

  const now = new Date();
  const dueDate = new Date(deadline);

  if (Number.isNaN(dueDate.getTime())) {
    return 0;
  }

  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 35;
  if (diffDays <= 1) return 30;
  if (diffDays <= 3) return 25;
  if (diffDays <= 7) return 15;
  return 5;
}

function getDurationFitScore(taskDuration, gapDuration) {
  const spareTime = gapDuration - taskDuration;

  if (taskDuration > gapDuration) return -1000;
  if (spareTime < 0) return -1000;

  if (spareTime <= 5) return 30;
  if (spareTime <= 10) return 25;
  if (spareTime <= 20) return 20;
  if (spareTime <= 30) return 10;
  return 5;
}

function buildReasonText(task, gap, gapEnergyLevel) {
  const reasons = [];

  reasons.push(
    `fits your ${gap.duration_minutes}-minute gap because it should take about ${task.estimated_duration} minutes`
  );

  if (task.priority === "high") {
    reasons.push("it is high priority");
  }

  if (task.deadline) {
    reasons.push("it has a deadline");
  }

  if (task.energy_level === gapEnergyLevel) {
    reasons.push(`its ${task.energy_level} energy level suits this time of day`);
  }

  return `Suggested because ${reasons.join(", ")}.`;
}

function scoreTaskForGap(task, gap) {
  const gapEnergyLevel = inferGapEnergyLevel(gap.start_time);

  const durationScore = getDurationFitScore(
    task.estimated_duration,
    gap.duration_minutes
  );

  if (durationScore < 0) {
    return null;
  }

  const score =
    durationScore +
    getPriorityScore(task.priority) +
    getEnergyScore(task.energy_level, gapEnergyLevel) +
    getDeadlineScore(task.deadline);

  return {
    task,
    score,
    reason: buildReasonText(task, gap, gapEnergyLevel),
    gap_energy_level: gapEnergyLevel,
  };
}

function detectGapsForDay(entries, options = {}) {
  const {
    dayStart = "08:00",
    dayEnd = "20:00",
    minGapMinutes = 15,
  } = options;

  const sortedEntries = [...entries].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );

  const gaps = [];
  let currentPointer = timeToMinutes(dayStart);

  for (const entry of sortedEntries) {
    const entryStart = timeToMinutes(entry.start_time);
    const entryEnd = timeToMinutes(entry.end_time);

    if (entryStart > currentPointer) {
      const gapDuration = entryStart - currentPointer;

      if (gapDuration >= minGapMinutes) {
        gaps.push({
          day_of_week: entry.day_of_week,
          start_time: minutesToTime(currentPointer),
          end_time: minutesToTime(entryStart),
          duration_minutes: gapDuration,
          category: getGapCategory(gapDuration),
          before_entry: null,
          after_entry: entry.title,
        });
      }
    }

    if (entryEnd > currentPointer) {
      currentPointer = entryEnd;
    }
  }

  const endOfDay = timeToMinutes(dayEnd);

  if (currentPointer < endOfDay) {
    const gapDuration = endOfDay - currentPointer;

    if (gapDuration >= minGapMinutes) {
      gaps.push({
        day_of_week: entries[0]?.day_of_week || null,
        start_time: minutesToTime(currentPointer),
        end_time: minutesToTime(endOfDay),
        duration_minutes: gapDuration,
        category: getGapCategory(gapDuration),
        before_entry: sortedEntries[sortedEntries.length - 1]?.title || null,
        after_entry: null,
      });
    }
  }

  for (let i = 0; i < gaps.length; i += 1) {
    const currentGap = gaps[i];

    const previousEntry =
      sortedEntries.find(
        (entry) => entry.end_time === currentGap.start_time
      ) || null;

    const nextEntry =
      sortedEntries.find(
        (entry) => entry.start_time === currentGap.end_time
      ) || null;

    currentGap.before_entry = previousEntry ? previousEntry.title : null;
    currentGap.after_entry = nextEntry ? nextEntry.title : null;
  }

  return gaps;
}

function groupEntriesByDay(entries) {
  const grouped = {};

  for (const day of DAYS_OF_WEEK) {
    grouped[day] = [];
  }

  for (const entry of entries) {
    if (!grouped[entry.day_of_week]) {
      grouped[entry.day_of_week] = [];
    }

    grouped[entry.day_of_week].push(entry);
  }

  return grouped;
}

function recommendTaskForGap(gap, tasks) {
  const scoredTasks = tasks
    .map((task) => scoreTaskForGap(task, gap))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (scoredTasks.length === 0) {
    return {
      gap,
      recommendation: null,
      alternatives: [],
      message: "No suitable task fits this gap.",
    };
  }

  const best = scoredTasks[0];
  const alternatives = scoredTasks.slice(1, 3).map((item) => ({
    id: item.task.id,
    title: item.task.title,
    estimated_duration: item.task.estimated_duration,
    priority: item.task.priority,
    energy_level: item.task.energy_level,
    score: item.score,
  }));

  return {
    gap,
    recommendation: {
      id: best.task.id,
      title: best.task.title,
      description: best.task.description,
      estimated_duration: best.task.estimated_duration,
      priority: best.task.priority,
      energy_level: best.task.energy_level,
      deadline: best.task.deadline,
      status: best.task.status,
      score: best.score,
      reason: best.reason,
    },
    alternatives,
    message: null,
  };
}

async function generateRecommendationsForUser(userId, options = {}) {
  const timetableEntries = await timetableModel.getAllTimetableEntries(userId);
  const pendingTasks = await taskModel.getPendingTasks(userId);

  if (!timetableEntries.length) {
    return {
      recommendations: [],
      summary: {
        total_gaps: 0,
        total_pending_tasks: pendingTasks.length,
        message: "No timetable entries found.",
      },
    };
  }

  if (!pendingTasks.length) {
    return {
      recommendations: [],
      summary: {
        total_gaps: 0,
        total_pending_tasks: 0,
        message: "No pending tasks found.",
      },
    };
  }

  const groupedEntries = groupEntriesByDay(timetableEntries);
  const allRecommendations = [];

  for (const day of DAYS_OF_WEEK) {
    const entriesForDay = groupedEntries[day];

    if (!entriesForDay || entriesForDay.length === 0) {
      continue;
    }

    const gaps = detectGapsForDay(entriesForDay, options);

    for (const gap of gaps) {
      const result = recommendTaskForGap(gap, pendingTasks);
      allRecommendations.push(result);
    }
  }

  return {
    recommendations: allRecommendations,
    summary: {
      total_gaps: allRecommendations.length,
      total_pending_tasks: pendingTasks.length,
      message:
        allRecommendations.length > 0
          ? "Recommendations generated successfully."
          : "No useful gaps found in the timetable.",
    },
  };
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  detectGapsForDay,
  recommendTaskForGap,
  generateRecommendationsForUser,
};