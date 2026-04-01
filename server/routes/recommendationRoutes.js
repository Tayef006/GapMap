const express = require("express");
const router = express.Router();

const {
  getRecommendations,
} = require("../controllers/recommendationController");

// Get generated recommendations for a user
router.get("/", getRecommendations);

module.exports = router;