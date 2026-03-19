function getPeriodStart(period) {
  const now = new Date();

  if (period === "all") {
    return null;
  }

  if (period === "ytd") {
    return new Date(now.getFullYear(), 0, 1);
  }

  if (period === "year") {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    return start;
  }

  if (period === "month") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return start;
  }

  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }

  if (period === "day") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    return start;
  }

  return null;
}

module.exports = {
  getPeriodStart,
};
