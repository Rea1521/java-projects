package com.employeemanagement.config;

import com.employeemanagement.model.*;
import com.employeemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final HolidayRepository holidayRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@employeemanagement.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            
            // Create admin employee profile
            Employee adminEmployee = new Employee();
            adminEmployee.setUser(admin);
            adminEmployee.setFirstName("System");
            adminEmployee.setLastName("Administrator");
            adminEmployee.setHireDate(LocalDate.now());
            adminEmployee.setAnnualLeaveBalance(15.0);
            adminEmployee.setSickLeaveBalance(12.0);
            adminEmployee.setCasualLeaveBalance(10.0);
            employeeRepository.save(adminEmployee);
        }
        
        // Create sample departments
        if (departmentRepository.count() == 0) {
            Department it = new Department();
            it.setName("Information Technology");
            it.setDescription("Responsible for company technical infrastructure");
            departmentRepository.save(it);
            
            Department hr = new Department();
            hr.setName("Human Resources");
            hr.setDescription("Manages employee relations and recruitment");
            departmentRepository.save(hr);
            
            Department finance = new Department();
            finance.setName("Finance");
            finance.setDescription("Handles financial operations and accounting");
            departmentRepository.save(finance);
        }
        
        // Create sample holidays
        if (holidayRepository.count() == 0) {
            int currentYear = LocalDate.now().getYear();
            
            Holiday newYear = new Holiday();
            newYear.setName("New Year's Day");
            newYear.setDate(LocalDate.of(currentYear, 1, 1));
            newYear.setDescription("Celebration of the new year");
            newYear.setRecurring(true);
            holidayRepository.save(newYear);
            
            Holiday independence = new Holiday();
            independence.setName("Independence Day");
            independence.setDate(LocalDate.of(currentYear, 7, 4));
            independence.setDescription("Celebration of independence");
            independence.setRecurring(true);
            holidayRepository.save(independence);
            
            Holiday christmas = new Holiday();
            christmas.setName("Christmas Day");
            christmas.setDate(LocalDate.of(currentYear, 12, 25));
            christmas.setDescription("Christmas celebration");
            christmas.setRecurring(true);
            holidayRepository.save(christmas);
        }
    }
}
