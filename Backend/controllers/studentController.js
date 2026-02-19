const Student = require("../models/Student");

exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { className, section } = req.query;

    const filter = {};
    if (className) filter.className = className;
    if (section) filter.section = section;

    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};
