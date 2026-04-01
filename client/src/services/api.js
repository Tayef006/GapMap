const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.error
        ? data.error
        : "Something went wrong with the request";
    throw new Error(message);
  }

  return data;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return handleResponse(response);
}

/* -------------------------
   Timetable API
------------------------- */

export function getTimetableEntries(userId = 1) {
  return request(`/timetable?user_id=${userId}`);
}

export function getTimetableEntriesByDay(day, userId = 1) {
  return request(`/timetable/day/${encodeURIComponent(day)}?user_id=${userId}`);
}

export function getTimetableEntryById(id, userId = 1) {
  return request(`/timetable/${id}?user_id=${userId}`);
}

export function createTimetableEntry(entryData) {
  return request("/timetable", {
    method: "POST",
    body: JSON.stringify(entryData),
  });
}

export function updateTimetableEntry(id, entryData) {
  return request(`/timetable/${id}`, {
    method: "PUT",
    body: JSON.stringify(entryData),
  });
}

export function deleteTimetableEntry(id, userId = 1) {
  return request(`/timetable/${id}?user_id=${userId}`, {
    method: "DELETE",
  });
}

/* -------------------------
   Task API
------------------------- */

export function getTasks(userId = 1) {
  return request(`/tasks?user_id=${userId}`);
}

export function getPendingTasks(userId = 1) {
  return request(`/tasks/pending?user_id=${userId}`);
}

export function getTaskById(id, userId = 1) {
  return request(`/tasks/${id}?user_id=${userId}`);
}

export function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(id, taskData) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

export function updateTaskStatus(id, status, userId = 1) {
  return request(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ user_id: userId, status }),
  });
}

export function deleteTask(id, userId = 1) {
  return request(`/tasks/${id}?user_id=${userId}`, {
    method: "DELETE",
  });
}

/* -------------------------
   Recommendation API
------------------------- */

export function getRecommendations(
  userId = 1,
  options = {}
) {
  const params = new URLSearchParams({
    user_id: userId,
    ...(options.minGapMinutes && { minGapMinutes: options.minGapMinutes }),
    ...(options.dayStart && { dayStart: options.dayStart }),
    ...(options.dayEnd && { dayEnd: options.dayEnd }),
  });

  return request(`/recommendations?${params.toString()}`);
}