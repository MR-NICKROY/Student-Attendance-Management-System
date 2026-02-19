const Teacher = require("../models/Teacher");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res, next) => {
  try {
    const { name, password, secretId } = req.body;

    if (secretId !== process.env.TEACHER_SECRET_ID) {
      res.status(403);
      throw new Error("Invalid Teacher Secret ID");
    }

    const teacherExists = await Teacher.findOne({ name });
    if (teacherExists) {
      res.status(400);
      throw new Error("Teacher already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await Teacher.create({ name, password: hashedPassword });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      token: generateToken(teacher._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    const teacher = await Teacher.findOne({ name });

    if (teacher && await bcrypt.compare(password, teacher.password)) {
      res.json({
        _id: teacher._id,
        name: teacher.name,
        token: generateToken(teacher._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    next(err);
  }
};
