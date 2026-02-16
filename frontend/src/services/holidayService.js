import api from './api';

export const getAllHolidays = async () => {
  const response = await api.get('/holidays');
  return response.data;
};

export const getHolidayById = async (id) => {
  const response = await api.get(`/holidays/${id}`);
  return response.data;
};

export const createHoliday = async (holidayData) => {
  const response = await api.post('/holidays', holidayData);
  return response.data;
};

export const updateHoliday = async (id, holidayData) => {
  const response = await api.put(`/holidays/${id}`, holidayData);
  return response.data;
};

export const deleteHoliday = async (id) => {
  const response = await api.delete(`/holidays/${id}`);
  return response.data;
};

export const getHolidaysInRange = async (startDate, endDate) => {
  const response = await api.get('/holidays/range', {
    params: { startDate, endDate }
  });
  return response.data;
};

export const getUpcomingHolidays = async (days = 30) => {
  const response = await api.get('/holidays/upcoming', {
    params: { days }
  });
  return response.data;
};

export const checkIsHoliday = async (date) => {
  const response = await api.get('/holidays/check', {
    params: { date }
  });
  return response.data;
};