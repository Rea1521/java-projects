import {format, differenceInCalendarDays, isWeekend, parseISO} from 'date-fns';
import {LEAVE_STATUS, LEAVE_TYPES} from './constants';

export const formatDate = (date: string | Date, pattern = 'dd MMM yyyy') => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return String(date);
  }
};

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
};

export const countWorkingDays = (start: Date, end: Date): number => {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const getStatusStyle = (status: string) => {
  return LEAVE_STATUS[status as keyof typeof LEAVE_STATUS] || LEAVE_STATUS.PENDING;
};

export const getLeaveTypeLabel = (type: string) => {
  return LEAVE_TYPES.find(t => t.value === type)?.label || type.replace('_', ' ');
};

export const getLeaveTypeColor = (type: string) => {
  return LEAVE_TYPES.find(t => t.value === type)?.color || '#4F46E5';
};

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return '#7C3AED';
    case 'MANAGER': return '#4F46E5';
    default: return '#10B981';
  }
};
