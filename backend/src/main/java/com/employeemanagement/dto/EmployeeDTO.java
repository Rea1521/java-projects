package com.employeemanagement.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EmployeeDTO {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String phoneNumber;
    private String address;
    private String emergencyContact;
    private String emergencyPhone;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private String role;
    private boolean active;
    private double annualLeaveBalance;
    private double sickLeaveBalance;
    private double casualLeaveBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}