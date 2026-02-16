package com.employeemanagement.serviceimpl;

import com.employeemanagement.dto.LeaveRequest;
import com.employeemanagement.dto.LeaveResponse;
import com.employeemanagement.exception.ResourceNotFoundException;
import com.employeemanagement.exception.UnauthorizedException;
import com.employeemanagement.model.*;
import com.employeemanagement.repository.EmployeeRepository;
import com.employeemanagement.repository.LeaveRepository;
import com.employeemanagement.service.AuditService;
import com.employeemanagement.service.LeaveService;
import com.employeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveServiceImpl implements LeaveService {
    
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final UserService userService;
    private final AuditService auditService;
    
    @Override
    public LeaveResponse applyForLeave(LeaveRequest leaveRequest) {
        User currentUser = userService.getCurrentUser();
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        
        // Validate leave dates
        if (leaveRequest.getStartDate().isAfter(leaveRequest.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        
        if (leaveRequest.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot apply for leave in the past");
        }
        
        // Calculate number of days
        long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        leaveRequest.setNumberOfDays(days);
        
        // Check for overlapping leaves
        if (leaveRepository.existsOverlappingLeave(employee, leaveRequest.getStartDate(), leaveRequest.getEndDate())) {
            throw new IllegalArgumentException("You already have a leave application for this period");
        }
        
        // Check leave balance
        double balance = getEmployeeLeaveBalance(employee.getId(), leaveRequest.getLeaveType().name());
        if (balance < days && leaveRequest.getLeaveType() != LeaveType.UNPAID_LEAVE) {
            throw new IllegalArgumentException("Insufficient leave balance. Available: " + balance);
        }
        
        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType(leaveRequest.getLeaveType());
        leave.setStartDate(leaveRequest.getStartDate());
        leave.setEndDate(leaveRequest.getEndDate());
        leave.setNumberOfDays(days);
        leave.setReason(leaveRequest.getReason());
        leave.setStatus(Leave.LeaveStatus.PENDING);
        
        Leave savedLeave = leaveRepository.save(leave);
        auditService.logAction("APPLY_LEAVE", "Leave", savedLeave.getId(), null, savedLeave.toString(), currentUser);
        
        return mapToResponse(savedLeave);
    }
    
    @Override
    public LeaveResponse approveLeave(Long leaveId, String comments) {
        User currentUser = userService.getCurrentUser();
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + leaveId));
        
        // Check if current user is manager or admin
        Employee manager = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        
        if (currentUser.getRole() != Role.ADMIN && 
            !leave.getEmployee().getManager().equals(manager)) {
            throw new UnauthorizedException("You are not authorized to approve this leave");
        }
        
        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leaves can be approved");
        }
        
        // Update leave balance
        Employee employee = leave.getEmployee();
        switch (leave.getLeaveType()) {
            case PAID_LEAVE:
                employee.setAnnualLeaveBalance(employee.getAnnualLeaveBalance() - leave.getNumberOfDays());
                break;
            case SICK_LEAVE:
                employee.setSickLeaveBalance(employee.getSickLeaveBalance() - leave.getNumberOfDays());
                break;
            case CASUAL_LEAVE:
                employee.setCasualLeaveBalance(employee.getCasualLeaveBalance() - leave.getNumberOfDays());
                break;
            default:
                // Unpaid leave doesn't affect balance
                break;
        }
        
        employeeRepository.save(employee);
        
        leave.setStatus(Leave.LeaveStatus.APPROVED);
        leave.setApprovedBy(manager);
        leave.setApprovalDate(LocalDate.now());
        leave.setComments(comments);
        
        Leave updatedLeave = leaveRepository.save(leave);
        auditService.logAction("APPROVE_LEAVE", "Leave", updatedLeave.getId(), 
                "PENDING", "APPROVED", currentUser);
        
        return mapToResponse(updatedLeave);
    }
    
    @Override
    public LeaveResponse rejectLeave(Long leaveId, String reason) {
        User currentUser = userService.getCurrentUser();
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + leaveId));
        
        // Check if current user is manager or admin
        Employee manager = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        
        if (currentUser.getRole() != Role.ADMIN && 
            !leave.getEmployee().getManager().equals(manager)) {
            throw new UnauthorizedException("You are not authorized to reject this leave");
        }
        
        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new IllegalStateException("Only pending leaves can be rejected");
        }
        
        leave.setStatus(Leave.LeaveStatus.REJECTED);
        leave.setRejectionReason(reason);
        leave.setApprovedBy(manager);
        leave.setApprovalDate(LocalDate.now());
        
        Leave updatedLeave = leaveRepository.save(leave);
        auditService.logAction("REJECT_LEAVE", "Leave", updatedLeave.getId(), 
                "PENDING", "REJECTED", currentUser);
        
        return mapToResponse(updatedLeave);
    }
    
    @Override
    public LeaveResponse cancelLeave(Long leaveId) {
        User currentUser = userService.getCurrentUser();
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + leaveId));
        
        // Only the employee who applied or admin can cancel
        Employee employee = employeeRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
        
        if (currentUser.getRole() != Role.ADMIN && !leave.getEmployee().equals(employee)) {
            throw new UnauthorizedException("You can only cancel your own leaves");
        }
        
        if (leave.getStatus() == Leave.LeaveStatus.APPROVED) {
            // Restore leave balance
            switch (leave.getLeaveType()) {
                case PAID_LEAVE:
                    employee.setAnnualLeaveBalance(employee.getAnnualLeaveBalance() + leave.getNumberOfDays());
                    break;
                case SICK_LEAVE:
                    employee.setSickLeaveBalance(employee.getSickLeaveBalance() + leave.getNumberOfDays());
                    break;
                case CASUAL_LEAVE:
                    employee.setCasualLeaveBalance(employee.getCasualLeaveBalance() + leave.getNumberOfDays());
                    break;
                default:
                    break;
            }
            employeeRepository.save(employee);
        }
        
        leave.setStatus(Leave.LeaveStatus.CANCELLED);
        Leave updatedLeave = leaveRepository.save(leave);
        auditService.logAction("CANCEL_LEAVE", "Leave", updatedLeave.getId(), 
                leave.getStatus().name(), "CANCELLED", currentUser);
        
        return mapToResponse(updatedLeave);
    }
    
    @Override
    public List<LeaveResponse> getEmployeeLeaves(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        
        return leaveRepository.findByEmployee(employee).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LeaveResponse> getDepartmentLeaves(Long departmentId) {
        return leaveRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LeaveResponse> getManagerPendingLeaves(Long managerId) {
        return leaveRepository.findByManagerId(managerId).stream()
                .filter(leave -> leave.getStatus() == Leave.LeaveStatus.PENDING)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public LeaveResponse getLeaveById(Long leaveId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + leaveId));
        return mapToResponse(leave);
    }
    
    @Override
    public double getEmployeeLeaveBalance(Long employeeId, String leaveType) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        
        LeaveType type = LeaveType.valueOf(leaveType);
        int currentYear = LocalDate.now().getYear();
        
        List<Leave> approvedLeaves = leaveRepository.findApprovedLeavesByEmployeeAndYear(
                employee, type, currentYear);
        
        double takenDays = approvedLeaves.stream()
                .mapToDouble(Leave::getNumberOfDays)
                .sum();
        
        switch (type) {
            case PAID_LEAVE:
                return employee.getAnnualLeaveBalance() - takenDays;
            case SICK_LEAVE:
                return employee.getSickLeaveBalance() - takenDays;
            case CASUAL_LEAVE:
                return employee.getCasualLeaveBalance() - takenDays;
            default:
                return 0;
        }
    }
    
    @Override
    public List<LeaveResponse> getAllLeaves() {
        return leaveRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private LeaveResponse mapToResponse(Leave leave) {
        LeaveResponse response = new LeaveResponse();
        response.setId(leave.getId());
        response.setEmployeeId(leave.getEmployee().getId());
        response.setEmployeeName(leave.getEmployee().getFullName());
        response.setLeaveType(leave.getLeaveType());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setNumberOfDays(leave.getNumberOfDays());
        response.setReason(leave.getReason());
        response.setStatus(leave.getStatus());
        response.setComments(leave.getComments());
        
        if (leave.getApprovedBy() != null) {
            response.setApprovedBy(leave.getApprovedBy().getFullName());
            response.setApprovalDate(leave.getApprovalDate());
        }
        
        response.setRejectionReason(leave.getRejectionReason());
        response.setCreatedAt(leave.getCreatedAt());
        
        return response;
    }
}
