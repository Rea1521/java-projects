import api from './api';

export const applyForLeave = async (data: any) => {
  const response = await api.post('/leaves/apply', data);
  return response.data;
};

export const getMyLeaves = async (employeeId: number) => {
  const response = await api.get(`/leaves/employee/${employeeId}`);
  return response.data;
};

export const getPendingLeaves = async (managerId: number) => {
  const response = await api.get(`/leaves/pending/manager/${managerId}`);
  return response.data;
};

export const getAllLeaves = async () => {
  const response = await api.get('/leaves/all');
  return response.data;
};

export const approveLeave = async (leaveId: number, comments: string) => {
  const response = await api.put(`/leaves/${leaveId}/approve`, null, {
    params: {comments},
  });
  return response.data;
};

export const rejectLeave = async (leaveId: number, reason: string) => {
  const response = await api.put(`/leaves/${leaveId}/reject`, null, {
    params: {reason},
  });
  return response.data;
};

export const cancelLeave = async (leaveId: number) => {
  const response = await api.put(`/leaves/${leaveId}/cancel`);
  return response.data;
};

export const getLeaveBalance = async (employeeId: number, leaveType: string) => {
  const response = await api.get(`/leaves/balance/${employeeId}`, {
    params: {leaveType},
  });
  return response.data;
};
