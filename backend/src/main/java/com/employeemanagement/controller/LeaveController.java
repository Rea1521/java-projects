package com.employeemanagement.controller;

import com.employeemanagement.dto.LeaveRequest;
import com.employeemanagement.dto.LeaveResponse;
import com.employeemanagement.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")

@RequiredArgsConstructor
public class LeaveController {
    
    private final LeaveService leaveService;
    
    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> applyForLeave(@Valid @RequestBody LeaveRequest leaveRequest) {
        LeaveResponse response = leaveService.applyForLeave(leaveRequest);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> approveLeave(@PathVariable Long leaveId, 
                                          @RequestParam(required = false) String comments) {
        LeaveResponse response = leaveService.approveLeave(leaveId, comments);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> rejectLeave(@PathVariable Long leaveId, 
                                         @RequestParam String reason) {
        LeaveResponse response = leaveService.rejectLeave(leaveId, reason);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{leaveId}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> cancelLeave(@PathVariable Long leaveId) {
        LeaveResponse response = leaveService.cancelLeave(leaveId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getEmployeeLeaves(@PathVariable Long employeeId) {
        List<LeaveResponse> leaves = leaveService.getEmployeeLeaves(employeeId);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/pending/manager/{managerId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> getManagerPendingLeaves(@PathVariable Long managerId) {
        List<LeaveResponse> leaves = leaveService.getManagerPendingLeaves(managerId);
        return ResponseEntity.ok(leaves);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllLeaves() {
        List<LeaveResponse> leaves = leaveService.getAllLeaves();
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/{leaveId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getLeaveById(@PathVariable Long leaveId) {
        LeaveResponse response = leaveService.getLeaveById(leaveId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/balance/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getLeaveBalance(@PathVariable Long employeeId, 
                                             @RequestParam String leaveType) {
        double balance = leaveService.getEmployeeLeaveBalance(employeeId, leaveType);
        return ResponseEntity.ok(balance);
    }
}
