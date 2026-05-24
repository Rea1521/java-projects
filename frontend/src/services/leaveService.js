import api from './api';

export const applyForLeave = async (leaveData) => {
  const response = await api.post('/leaves/apply', leaveData);
  return response.data;
};

// Fetch leaves for a specific employee by their employee ID
export const getMyLeaves = async (employeeId) => {
  const response = await api.get(`/leaves/employee/${employeeId}`);
  return response.data;
};

export const getEmployeeLeaves = async (employeeId) => {
  const response = await api.get(`/leaves/employee/${employeeId}`);
  return response.data;
};

export const getPendingLeaves = async (managerId) => {
  const response = await api.get(`/leaves/pending/manager/${managerId}`);
  return response.data;
};

export const getManagerPendingLeaves = async (managerId) => {
  const response = await api.get(`/leaves/pending/manager/${managerId}`);
  return response.data;
};

// Admin: get all leaves (backend uses /leaves endpoint - no /all)
export const getAllLeaves = async () => {
  const response = await api.get('/leaves/all');
  return response.data;
};

export const approveLeave = async (leaveId, comments) => {
  const response = await api.put(`/leaves/${leaveId}/approve`, null, {
    params: { comments }
  });
  return response.data;
};

export const rejectLeave = async (leaveId, reason) => {
  const response = await api.put(`/leaves/${leaveId}/reject`, null, {
    params: { reason }
  });
  return response.data;
};

export const cancelLeave = async (leaveId) => {
  const response = await api.put(`/leaves/${leaveId}/cancel`);
  return response.data;
};

export const getLeaveBalance = async (employeeId, leaveType) => {
  const response = await api.get(`/leaves/balance/${employeeId}`, {
    params: { leaveType }
  });
  return response.data;
};
