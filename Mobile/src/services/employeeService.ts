import api from './api';

export const getEmployeeByUserId = async (userId: number) => {
  const response = await api.get(`/employees/user/${userId}`);
  return response.data;
};

export const getEmployeeById = async (id: number) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const getAllEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const getEmployeesByManager = async (managerId: number) => {
  const response = await api.get(`/employees/manager/${managerId}`);
  return response.data;
};

export const createEmployee = async (data: any) => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployee = async (id: number, data: any) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: number) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};
