package com.employeemanagement.serviceimpl;

import com.employeemanagement.dto.EmployeeDTO;
import com.employeemanagement.exception.ResourceNotFoundException;
import com.employeemanagement.model.Employee;
import com.employeemanagement.model.User;
import com.employeemanagement.repository.EmployeeRepository;
import com.employeemanagement.repository.UserRepository;
import com.employeemanagement.service.AuditService;
import com.employeemanagement.service.EmployeeService;
import com.employeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditService auditService;
    
    @Override
    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        User currentUser = userService.getCurrentUser();
        
        Employee employee = new Employee();
        mapDtoToEntity(employeeDTO, employee);
        
        // Associate with user if userId is provided
        if (employeeDTO.getUserId() != null) {
            User user = userRepository.findById(employeeDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + employeeDTO.getUserId()));
            employee.setUser(user);
        }
        
        Employee savedEmployee = employeeRepository.save(employee);
        auditService.logAction("CREATE_EMPLOYEE", "Employee", savedEmployee.getId(), 
                null, savedEmployee.toString(), currentUser);
        
        return mapToDto(savedEmployee);
    }
    
    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        User currentUser = userService.getCurrentUser();
        
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        mapDtoToEntity(employeeDTO, employee);
        
        Employee updatedEmployee = employeeRepository.save(employee);
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", updatedEmployee.getId(), 
                employee.toString(), updatedEmployee.toString(), currentUser);
        
        return mapToDto(updatedEmployee);
    }
    
    @Override
    public void deleteEmployee(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        employeeRepository.delete(employee);
        auditService.logAction("DELETE_EMPLOYEE", "Employee", id, 
                employee.toString(), null, currentUser);
    }
    
    @Override
    public Optional<EmployeeDTO> getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .map(this::mapToDto);
    }
    
    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EmployeeDTO> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public EmployeeDTO getEmployeeByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user id: " + userId));
        
        return mapToDto(employee);
    }
    
    @Override
    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return false; // Implement if needed
    }
    
    private EmployeeDTO mapToDto(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setUserId(employee.getUser() != null ? employee.getUser().getId() : null);
        dto.setUsername(employee.getUser() != null ? employee.getUser().getUsername() : null);
        dto.setEmail(employee.getUser() != null ? employee.getUser().getEmail() : null);
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setFullName(employee.getFullName());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setHireDate(employee.getHireDate());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setAddress(employee.getAddress());
        dto.setEmergencyContact(employee.getEmergencyContact());
        dto.setEmergencyPhone(employee.getEmergencyPhone());
        dto.setDepartmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null);
        dto.setDepartmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null);
        dto.setManagerId(employee.getManager() != null ? employee.getManager().getId() : null);
        dto.setManagerName(employee.getManager() != null ? employee.getManager().getFullName() : null);
        dto.setAnnualLeaveBalance(employee.getAnnualLeaveBalance());
        dto.setSickLeaveBalance(employee.getSickLeaveBalance());
        dto.setCasualLeaveBalance(employee.getCasualLeaveBalance());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());
        return dto;
    }
    
    private void mapDtoToEntity(EmployeeDTO dto, Employee employee) {
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setHireDate(dto.getHireDate());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setAddress(dto.getAddress());
        employee.setEmergencyContact(dto.getEmergencyContact());
        employee.setEmergencyPhone(dto.getEmergencyPhone());
        
        if (dto.getAnnualLeaveBalance() > 0) {
            employee.setAnnualLeaveBalance(dto.getAnnualLeaveBalance());
        }
        if (dto.getSickLeaveBalance() > 0) {
            employee.setSickLeaveBalance(dto.getSickLeaveBalance());
        }
        if (dto.getCasualLeaveBalance() > 0) {
            employee.setCasualLeaveBalance(dto.getCasualLeaveBalance());
        }
    }
}
