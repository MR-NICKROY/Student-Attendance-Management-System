const Attendance = require("../models/Attendance");

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      res.status(400);
      throw new Error("Invalid attendance data");
    }

    // Normalize date to midnight UTC to ensure consistency
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const validStatuses = ["P", "A", "L", "LV"];
    const operations = [];

    for (const record of records) {
      if (!record.studentId || !validStatuses.includes(record.status)) {
        continue; // Skip invalid records or throw error based on preference
      }

      operations.push({
        updateOne: {
          filter: {
            studentId: record.studentId,
            date: attendanceDate,
          },
          update: {
            $set: { status: record.status },
            $setOnInsert: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          upsert: true,
        },
      });
    }

    if (operations.length === 0) {
      res.status(400);
      throw new Error("No valid attendance records to save");
    }

    await Attendance.bulkWrite(operations);

    res.json({ message: "Attendance saved successfully" });
  } catch (error) {
    next(error);
  }
};
