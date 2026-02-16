package com.employeemanagement.service;

import com.employeemanagement.dto.EmployeeDTO;
import com.employeemanagement.model.Employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeService {
    EmployeeDTO createEmployee(EmployeeDTO employeeDTO);
    EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO);
    void deleteEmployee(Long id);
    Optional<EmployeeDTO> getEmployeeById(Long id);
    List<EmployeeDTO> getAllEmployees();
    List<EmployeeDTO> getEmployeesByDepartment(Long departmentId);
    List<EmployeeDTO> getEmployeesByManager(Long managerId);
    EmployeeDTO getEmployeeByUserId(Long userId);
    Employee getEmployeeEntityById(Long id);
    boolean existsByEmail(String email);
}