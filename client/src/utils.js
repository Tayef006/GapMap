export function formatMinutes(minutes) {
  const totalMinutes = Number(minutes);

  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
    return "";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} mins`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }

  const hourText = hours === 1 ? "1 hr" : `${hours} hrs`;
  return `${hourText} ${remainingMinutes} mins`;
}

export function capitalise(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return "";
  }

  return `${startTime} - ${endTime}`;
}

export function formatGapCategory(category) {
  if (!category || typeof category !== "string") {
    return "";
  }

  const labels = {
    "too-short": "Too Short",
    micro: "Micro",
    short: "Short",
    medium: "Medium",
    long: "Long",
  };

  return labels[category] || capitalise(category);
}

export function formatPriority(priority) {
  if (!priority || typeof priority !== "string") {
    return "";
  }

  return capitalise(priority);
}

export function formatEnergyLevel(energyLevel) {
  if (!energyLevel || typeof energyLevel !== "string") {
    return "";
  }

  return capitalise(energyLevel);
}

export function formatStatus(status) {
  if (!status || typeof status !== "string") {
    return "";
  }

  return capitalise(status);
}

export function sortEntriesByDayAndTime(entries) {
  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  return [...entries].sort((a, b) => {
    const dayDifference = (dayOrder[a.day_of_week] || 99) - (dayOrder[b.day_of_week] || 99);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return a.start_time.localeCompare(b.start_time);
  });
}