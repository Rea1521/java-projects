package com.employeemanagement.service;

import com.employeemanagement.model.AuditLog;
import com.employeemanagement.model.User;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditService {
    void logAction(String action, String entityType, Long entityId, String oldValue, String newValue, User user);
    List<AuditLog> getUserAuditLogs(Long userId);
    List<AuditLog> getEntityAuditLogs(String entityType, Long entityId);
    List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<AuditLog> getAllAuditLogs();
}
