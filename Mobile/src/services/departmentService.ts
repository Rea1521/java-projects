import api from './api';

export const getAllDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const createDepartment = async (data: any) => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: number, data: any) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};
