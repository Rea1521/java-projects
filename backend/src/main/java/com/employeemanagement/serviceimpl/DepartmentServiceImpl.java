package com.employeemanagement.serviceimpl;

import com.employeemanagement.dto.DepartmentDTO;
import com.employeemanagement.dto.EmployeeDTO;
import com.employeemanagement.exception.ResourceNotFoundException;
import com.employeemanagement.model.Department;
import com.employeemanagement.model.Employee;
import com.employeemanagement.model.User;  // ADD THIS IMPORT
import com.employeemanagement.repository.DepartmentRepository;
import com.employeemanagement.repository.EmployeeRepository;
import com.employeemanagement.service.AuditService;
import com.employeemanagement.service.DepartmentService;
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
public class DepartmentServiceImpl implements DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final UserService userService;
    private final AuditService auditService;
    
    @Override
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        User currentUser = userService.getCurrentUser();
        
        // Check if department with same name already exists
        if (departmentRepository.existsByName(departmentDTO.getName())) {
            throw new IllegalArgumentException("Department with name '" + departmentDTO.getName() + "' already exists");
        }
        
        Department department = new Department();
        mapDtoToEntity(departmentDTO, department);
        
        Department savedDepartment = departmentRepository.save(department);
        auditService.logAction("CREATE_DEPARTMENT", "Department", savedDepartment.getId(), 
                null, savedDepartment.toString(), currentUser);
        
        return mapToDto(savedDepartment);
    }
    
    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        User currentUser = userService.getCurrentUser();
        
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        
        // Store old values for audit
        String oldValues = department.toString();
        
        // Check if name is being changed and if new name already exists
        if (!department.getName().equals(departmentDTO.getName()) && 
            departmentRepository.existsByName(departmentDTO.getName())) {
            throw new IllegalArgumentException("Department with name '" + departmentDTO.getName() + "' already exists");
        }
        
        mapDtoToEntity(departmentDTO, department);
        
        Department updatedDepartment = departmentRepository.save(department);
        auditService.logAction("UPDATE_DEPARTMENT", "Department", updatedDepartment.getId(), 
                oldValues, updatedDepartment.toString(), currentUser);
        
        return mapToDto(updatedDepartment);
    }
    
    @Override
    public void deleteDepartment(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        
        // Check if department has employees
        if (department.getEmployees() != null && !department.getEmployees().isEmpty()) {
            throw new IllegalStateException("Cannot delete department with existing employees. Please reassign employees first.");
        }
        
        String oldValues = department.toString();
        
        departmentRepository.delete(department);
        auditService.logAction("DELETE_DEPARTMENT", "Department", id, 
                oldValues, null, currentUser);
    }
    
    @Override
    public Optional<DepartmentDTO> getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(this::mapToDto);
    }
    
    @Override
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public Department getDepartmentEntityById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }
    
    @Override
    public boolean existsByName(String name) {
        return departmentRepository.existsByName(name);
    }
    
    @Override
    public List<EmployeeDTO> getDepartmentEmployees(Long departmentId) {
        // Verify department exists
        Department department = getDepartmentEntityById(departmentId);
        
        // Get employees in department and convert to DTOs
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(employee -> {
                    // Try to get from employeeService, or create basic DTO if not available
                    try {
                        return employeeService.getEmployeeById(employee.getId()).orElse(null);
                    } catch (Exception e) {
                        // Fallback: create a basic EmployeeDTO
                        EmployeeDTO dto = new EmployeeDTO();
                        dto.setId(employee.getId());
                        dto.setFirstName(employee.getFirstName());
                        dto.setLastName(employee.getLastName());
                        dto.setFullName(employee.getFullName());
                        if (employee.getUser() != null) {
                            dto.setUserId(employee.getUser().getId());
                            dto.setEmail(employee.getUser().getEmail());
                            dto.setUsername(employee.getUser().getUsername());
                        }
                        return dto;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    
    private DepartmentDTO mapToDto(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        
        if (department.getDepartmentManager() != null) {
            dto.setManagerId(department.getDepartmentManager().getId());
            dto.setManagerName(department.getDepartmentManager().getFullName());
        }
        
        dto.setEmployeeCount(department.getEmployees() != null ? department.getEmployees().size() : 0);
        dto.setCreatedAt(department.getCreatedAt());
        dto.setUpdatedAt(department.getUpdatedAt());
        
        return dto;
    }
    
    private void mapDtoToEntity(DepartmentDTO dto, Department department) {
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        
        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + dto.getManagerId()));
            department.setDepartmentManager(manager);
            
            // Update the manager's department if needed
            if (manager.getDepartment() == null || !manager.getDepartment().getId().equals(department.getId())) {
                manager.setDepartment(department);
            }
        } else {
            department.setDepartmentManager(null);
        }
    }
}