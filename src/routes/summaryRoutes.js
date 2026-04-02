const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summaryController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// All roles can access summaries (viewer, analyst, admin)
router.use(authenticate);
router.use(authorize("summary:read"));

router.get("/overview", summaryController.getOverallSummary);
router.get("/categories", summaryController.getCategoryBreakdown);
router.get("/trends", summaryController.getMonthlyTrends);
router.get("/recent", summaryController.getRecentActivity);

module.exports = router;
