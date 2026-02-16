export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-+()]{10,}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validateDate = (date) => {
  return moment(date).isValid();
};

export const validateFutureDate = (date) => {
  return moment(date).isAfter(moment().subtract(1, 'day'));
};

export const validateDateRange = (startDate, endDate) => {
  return moment(startDate).isSameOrBefore(moment(endDate));
};

export const validateLeaveDays = (days, maxDays) => {
  return days <= maxDays;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};
