const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.teacher = await Teacher.findById(decoded.id);

      if (!req.teacher) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (err) {
      res.status(401);
      next(new Error("Not authorized"));
    }
  } else {
    res.status(401);
    next(new Error("No token provided"));
  }
};

module.exports = protect;
