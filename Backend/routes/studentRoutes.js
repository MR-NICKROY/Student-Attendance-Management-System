const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const controller = require("../controllers/studentController");

router.use(protect);

router.post("/", controller.createStudent);
router.get("/", controller.getStudents);
router.put("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

module.exports = router;
