package com.employeemanagement.serviceimpl;

import com.employeemanagement.dto.EmployeeDTO;
import com.employeemanagement.exception.ResourceNotFoundException;
import com.employeemanagement.model.Employee;
import com.employeemanagement.model.Role;
import com.employeemanagement.model.User;
import com.employeemanagement.repository.DepartmentRepository;
import com.employeemanagement.repository.EmployeeRepository;
import com.employeemanagement.repository.UserRepository;
import com.employeemanagement.service.AuditService;
import com.employeemanagement.service.EmployeeService;
import com.employeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final DepartmentRepository departmentRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        User currentUser = userService.getCurrentUser();
        Employee employee = new Employee();

        // If userId supplied link to existing user, otherwise create a new User account
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getUserId()));
            employee.setUser(user);
            syncUserFields(user, dto);
            userRepository.save(user);
        } else {
            // Admin is creating a brand-new employee — auto-create a User account
            // so that role and active are persisted on the User entity
            User newUser = new User();

            // Username: use provided, or fall back to firstName.lastName
            String username = (dto.getUsername() != null && !dto.getUsername().isBlank())
                    ? dto.getUsername().trim()
                    : (dto.getFirstName() + "." + dto.getLastName()).toLowerCase().replaceAll("\\s+", "");
            if (userRepository.existsByUsername(username)) {
                username = username + System.currentTimeMillis() % 1000;
            }
            newUser.setUsername(username);
            newUser.setEmail(dto.getEmail());

            String rawPassword = (dto.getPassword() != null && !dto.getPassword().isBlank())
                    ? dto.getPassword()
                    : "Welcome@123";   // default password admin can share with employee
            newUser.setPassword(passwordEncoder.encode(rawPassword));

            // Set role from DTO — this is what was missing before
            try {
                newUser.setRole(dto.getRole() != null
                        ? Role.valueOf(dto.getRole().toUpperCase())
                        : Role.EMPLOYEE);
            } catch (IllegalArgumentException e) {
                newUser.setRole(Role.EMPLOYEE);
            }
            newUser.setActive(dto.isActive());
            userRepository.save(newUser);
            employee.setUser(newUser);
        }

        mapDtoToEntity(dto, employee);
        Employee saved = employeeRepository.save(employee);
        auditService.logAction("CREATE_EMPLOYEE", "Employee", saved.getId(),
                null, saved.toString(), currentUser);
        return mapToDto(saved);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        User currentUser = userService.getCurrentUser();
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));

        mapDtoToEntity(dto, employee);

        if (employee.getUser() != null) {
            syncUserFields(employee.getUser(), dto);
            userRepository.save(employee.getUser());
        }

        Employee updated = employeeRepository.save(employee);
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", updated.getId(),
                employee.toString(), updated.toString(), currentUser);
        return mapToDto(updated);
    }

    /**
     * Sync role and active from DTO → User entity.
     * These fields live on User, not Employee, so without this
     * the employee list always shows the old role / inactive.
     */
    private void syncUserFields(User user, EmployeeDTO dto) {
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            try {
                user.setRole(Role.valueOf(dto.getRole().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        user.setActive(dto.isActive());
    }

    @Override
    public void deleteEmployee(Long id) {
        User currentUser = userService.getCurrentUser();
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
        employeeRepository.delete(employee);
        auditService.logAction("DELETE_EMPLOYEE", "Employee", id,
                employee.toString(), null, currentUser);
    }

    @Override
    public Optional<EmployeeDTO> getEmployeeById(Long id) {
        return employeeRepository.findById(id).map(this::mapToDto);
    }

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDTO> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO getEmployeeByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user: " + userId));
        return mapToDto(employee);
    }

    @Override
    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    @Override
    public boolean existsByEmail(String email) { return false; }

    @Override
    public Employee save(Employee employee) { return employeeRepository.save(employee); }

    private EmployeeDTO mapToDto(Employee e) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(e.getId());
        dto.setUserId(e.getUser() != null ? e.getUser().getId() : null);
        dto.setUsername(e.getUser() != null ? e.getUser().getUsername() : null);
        dto.setEmail(e.getUser() != null ? e.getUser().getEmail() : null);
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setFullName(e.getFullName());
        dto.setDateOfBirth(e.getDateOfBirth());
        dto.setHireDate(e.getHireDate());
        dto.setPhoneNumber(e.getPhoneNumber());
        dto.setAddress(e.getAddress());
        dto.setEmergencyContact(e.getEmergencyContact());
        dto.setEmergencyPhone(e.getEmergencyPhone());
        dto.setDepartmentId(e.getDepartment() != null ? e.getDepartment().getId() : null);
        dto.setDepartmentName(e.getDepartment() != null ? e.getDepartment().getName() : null);
        dto.setManagerId(e.getManager() != null ? e.getManager().getId() : null);
        dto.setManagerName(e.getManager() != null ? e.getManager().getFullName() : null);
        dto.setRole(e.getUser() != null && e.getUser().getRole() != null
                ? e.getUser().getRole().name() : null);
        dto.setActive(e.getUser() != null && e.getUser().isActive());
        dto.setAnnualLeaveBalance(e.getAnnualLeaveBalance());
        dto.setSickLeaveBalance(e.getSickLeaveBalance());
        dto.setCasualLeaveBalance(e.getCasualLeaveBalance());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }

    private void mapDtoToEntity(EmployeeDTO dto, Employee e) {
        e.setFirstName(dto.getFirstName());
        e.setLastName(dto.getLastName());
        e.setDateOfBirth(dto.getDateOfBirth());
        e.setHireDate(dto.getHireDate());
        e.setPhoneNumber(dto.getPhoneNumber());
        e.setAddress(dto.getAddress());
        e.setEmergencyContact(dto.getEmergencyContact());
        e.setEmergencyPhone(dto.getEmergencyPhone());
        if (dto.getDepartmentId() != null) {
            departmentRepository.findById(dto.getDepartmentId()).ifPresent(e::setDepartment);
        }
        if (dto.getManagerId() != null) {
            employeeRepository.findById(dto.getManagerId()).ifPresent(e::setManager);
        }
        e.setAnnualLeaveBalance(dto.getAnnualLeaveBalance());
        e.setSickLeaveBalance(dto.getSickLeaveBalance());
        e.setCasualLeaveBalance(dto.getCasualLeaveBalance());
    }
}
