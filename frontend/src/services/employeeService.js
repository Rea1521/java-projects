import api from './api';

export const getAllEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const getEmployeeByUserId = async (userId) => {
  const response = await api.get(`/employees/user/${userId}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const getEmployeesByDepartment = async (departmentId) => {
  const response = await api.get(`/employees/department/${departmentId}`);
  return response.data;
};

export const getEmployeesByManager = async (managerId) => {
  const response = await api.get(`/employees/manager/${managerId}`);
  return response.data;
};
