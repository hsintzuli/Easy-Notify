const moment = require('moment');

// Get the difference between the target time and now in seconds
const diffFromNow = (time) => {
  const targetTime = new Date(time);
  const now = new Date();
  return (targetTime.getTime() - now.getTime()) / 1000;
};

// Let the start date and end date meet two requirments:
// 1. Start date is less than end date.
// 2. End date is less than or equal to now.
const generateValidDatetimeRange = (startDate, endDate) => {
  const now = new Date();
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  startDate = startDate < endDate ? startDate : endDate;
  endDate = startDate < endDate ? endDate : startDate;
  if (moment(endDate).format('YYYY-MM-DD') >= moment(now).format('YYYY-MM-DD')) {
    endDate = now;
  } else {
    endDate = new Date(endDate.getTime() + (23 * 3600 + 59 * 60) * 1000);
  }

  return [startDate, endDate];
};

const getCheckHour = (delay) => {
  const now = new Date();
  console.log('delay', +delay);
  const hourToCheck = now.getHours() % 2 === +delay ? 'even' : 'odd';
  return hourToCheck;
};

const calDiffInterval = (startDate, endDate) => {
  const diffHour = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600));
  if (diffHour < 72) {
    interval = '%b-%d %H';
  } else if (diffHour < 60 * 24) {
    interval = '%b-%d';
  } else {
    interval = '%Y-%b';
  }
  return interval;
};

module.exports = {
  diffFromNow,
  generateValidDatetimeRange,
  getCheckHour,
  calDiffInterval,
};
