package com.employeemanagement.service;

import com.employeemanagement.dto.LeaveRequest;
import com.employeemanagement.dto.LeaveResponse;

import java.util.List;

public interface LeaveService {
    LeaveResponse applyForLeave(LeaveRequest leaveRequest);
    LeaveResponse approveLeave(Long leaveId, String comments);
    LeaveResponse rejectLeave(Long leaveId, String reason);
    LeaveResponse cancelLeave(Long leaveId);
    List<LeaveResponse> getEmployeeLeaves(Long employeeId);
    List<LeaveResponse> getDepartmentLeaves(Long departmentId);
    List<LeaveResponse> getManagerPendingLeaves(Long managerId);
    LeaveResponse getLeaveById(Long leaveId);
    double getEmployeeLeaveBalance(Long employeeId, String leaveType);
    List<LeaveResponse> getAllLeaves();
}