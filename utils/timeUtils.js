const moment = require('moment');

// Get the difference between the target time and now in seconds
const diffFromNow = (time, now) => {
  const targetTime = new Date(time);
  now = now || new Date();
  return (targetTime.getTime() - now.getTime()) / 1000;
};

// Let the start date and end date meet two requirments:
// 1. Start date is less than end date.
// 2. End date is less than or equal to now.
const generateValidDatetimeRange = (startDate, endDate, now = null) => {
  now = now || new Date();
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  [startDate, endDate] = startDate < endDate ? [startDate, endDate] : [endDate, startDate];
  startDate.setHours(0);
  startDate.setMinutes(0);
  if (moment(endDate).format('YYYY-MM-DD') >= moment(now).format('YYYY-MM-DD')) {
    endDate = now;
  } else {
    endDate.setHours(23);
    endDate.setMinutes(59);
  }
  return [startDate, endDate];
};

const getCheckHour = (delay, now) => {
  now = now || new Date();
  const hourToCheck = now.getHours() % 2 === +delay ? 'even' : 'odd';
  return hourToCheck;
};

// determine the groupby interval according to the difference between startDate & endDate
const calDiffInterval = (startDate, endDate) => {
  startDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  endDate = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffHour = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600));
  let interval;
  if (diffHour <= 72) {
    // If the difference is smaller than 72 hours, group by hour (%b-%d %H)
    interval = '%b-%d %H';
  } else if (diffHour <= 60 * 24) {
    // Else if the difference is smaller than 60 days, group by day
    interval = '%b-%d';
  } else {
    // Otherwise, group by month
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
