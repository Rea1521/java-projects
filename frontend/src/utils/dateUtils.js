import moment from 'moment';

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  return moment(date).format(format);
};

export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'days') + 1;
};

export const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getBusinessDays = (startDate, endDate) => {
  let days = 0;
  let current = moment(startDate);
  const end = moment(endDate);

  while (current <= end) {
    if (!isWeekend(current)) {
      days++;
    }
    current.add(1, 'days');
  }
  return days;
};

export const getMonthDays = (year, month) => {
  const daysInMonth = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();
  const days = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = moment(`${year}-${month}-${i}`, 'YYYY-M-D');
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: i,
      dayOfWeek: date.format('dddd'),
      isWeekend: isWeekend(date)
    });
  }
  
  return days;
};

export const isDateInRange = (date, startDate, endDate) => {
  const d = moment(date);
  return d.isBetween(moment(startDate), moment(endDate), 'day', '[]');
};

export const getRelativeTime = (date) => {
  return moment(date).fromNow();
};
