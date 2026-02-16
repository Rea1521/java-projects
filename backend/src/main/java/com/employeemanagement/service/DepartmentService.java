package com.employeemanagement.service;

import com.employeemanagement.dto.DepartmentDTO;
import com.employeemanagement.dto.EmployeeDTO;  
import com.employeemanagement.model.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {
    DepartmentDTO createDepartment(DepartmentDTO departmentDTO);
    DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO);
    void deleteDepartment(Long id);
    Optional<DepartmentDTO> getDepartmentById(Long id);
    List<DepartmentDTO> getAllDepartments();
    Department getDepartmentEntityById(Long id);
    boolean existsByName(String name);
    List<EmployeeDTO> getDepartmentEmployees(Long departmentId);  
}