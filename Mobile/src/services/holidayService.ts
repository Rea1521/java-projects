import api from './api';

export const getHolidays = async () => {
  const response = await api.get('/holidays');
  return response.data;
};

export const getUpcomingHolidays = async () => {
  const response = await api.get('/holidays/upcoming');
  return response.data;
};
