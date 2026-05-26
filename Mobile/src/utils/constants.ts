// Android emulator accesses host machine via 10.0.2.2
export const API_BASE_URL = 'http://10.0.2.2:8080/api';

export const STORAGE_KEYS = {
  TOKEN: '@LeaveApp:token',
  USER: '@LeaveApp:user',
};

export const LEAVE_TYPES = [
  {value: 'PAID_LEAVE', label: 'Paid Leave', color: '#4F46E5'},
  {value: 'SICK_LEAVE', label: 'Sick Leave', color: '#EF4444'},
  {value: 'CASUAL_LEAVE', label: 'Casual Leave', color: '#F59E0B'},
];

export const LEAVE_STATUS = {
  PENDING: {label: 'Pending', color: '#F59E0B', bg: '#FEF3C7'},
  APPROVED: {label: 'Approved', color: '#10B981', bg: '#D1FAE5'},
  REJECTED: {label: 'Rejected', color: '#EF4444', bg: '#FEE2E2'},
  CANCELLED: {label: 'Cancelled', color: '#94A3B8', bg: '#F1F5F9'},
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const APP_NAME = 'LeaveApp';
export const APP_TAGLINE = 'Smart Leave Management';
