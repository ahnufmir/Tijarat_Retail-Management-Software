const isValidDate = (date) => {
  if (!date || typeof date !== "string") {
    return false;
  }

  const parsedDate = new Date(date);

  return !isNaN(parsedDate.getTime());
};

const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return new Date(startDate) <= new Date(endDate);
};

module.exports = {
  isValidDate,

  isValidDateRange,
};
