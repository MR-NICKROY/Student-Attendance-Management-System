const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { bulkMarkAttendance } = require("../controllers/attendanceController");

router.use(protect);

router.post("/bulk", bulkMarkAttendance);

module.exports = router;
