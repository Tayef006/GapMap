const { generateRecommendationsForUser } = require("../services/recommendationEngine");

// Temporary helper until proper authentication is added
function getUserId(req) {
  return Number(req.body?.user_id || req.query?.user_id || 1);
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isValidTimeFormat(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

async function getRecommendations(req, res) {
  try {
    const userId = getUserId(req);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const minGapMinutes = parsePositiveInteger(req.query.minGapMinutes, 15);
    const dayStart = req.query.dayStart || "08:00";
    const dayEnd = req.query.dayEnd || "20:00";

    if (!isValidTimeFormat(dayStart) || !isValidTimeFormat(dayEnd)) {
      return res.status(400).json({
        error: "dayStart and dayEnd must be in HH:MM format",
      });
    }

    if (dayStart >= dayEnd) {
      return res.status(400).json({
        error: "dayStart must be earlier than dayEnd",
      });
    }

    const results = await generateRecommendationsForUser(userId, {
      minGapMinutes,
      dayStart,
      dayEnd,
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error generating recommendations:", error.message);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}

module.exports = {
  getRecommendations,
};