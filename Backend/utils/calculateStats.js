const calculateStats = (records) => {
  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;

  const uniqueDates = new Set();

  records.forEach((record) => {
    uniqueDates.add(record.date.toISOString().split("T")[0]);

    if (record.status === "P") present++;
    if (record.status === "A") absent++;
    if (record.status === "L") late++;
    if (record.status === "LV") leave++;
  });

  const totalMarked = present + absent + late + leave;
  const presentPercentage = totalMarked
    ? ((present / totalMarked) * 100).toFixed(1)
    : 0;

  return {
    totalDays: uniqueDates.size,
    present,
    absent,
    late,
    leave,
    totalMarked,
    presentPercentage,
  };
};

module.exports = calculateStats;
