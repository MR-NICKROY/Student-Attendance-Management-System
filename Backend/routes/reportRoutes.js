const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getStudentReport,
  getOverallReport,
} = require("../controllers/reportController");

router.use(protect);

router.get("/student/:id", getStudentReport);
router.get("/overall", getOverallReport);

module.exports = router;
