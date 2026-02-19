const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const calculateStats = require("../utils/calculateStats");

exports.getStudentReport = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    const records = await Attendance.find({ studentId });

    const stats = calculateStats(records);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getOverallReport = async (req, res, next) => {
  try {
    const { className, section } = req.query;

    let studentsFilter = {};
    if (className) studentsFilter.className = className;
    if (section) studentsFilter.section = section;

    const students = await Student.find(studentsFilter);

    const studentIds = students.map((s) => s._id);

    const records = await Attendance.find({
      studentId: { $in: studentIds },
    });

    const stats = calculateStats(records);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
