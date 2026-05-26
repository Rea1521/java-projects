package com.employeemanagement.dto;

import com.employeemanagement.model.Leave;
import com.employeemanagement.model.LeaveType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;      // ← was missing, caused N/A in table
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private double numberOfDays;
    private String reason;
    private Leave.LeaveStatus status;
    private String comments;
    private String approvedBy;
    private LocalDate approvalDate;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
