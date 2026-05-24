package com.employeemanagement.controller;

import com.employeemanagement.dto.LoginRequest;
import com.employeemanagement.dto.LoginResponse;
import com.employeemanagement.dto.RegisterRequest;
import com.employeemanagement.model.Employee;
import com.employeemanagement.model.Role;
import com.employeemanagement.model.User;
import com.employeemanagement.service.EmployeeService;
import com.employeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")

@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmployeeService employeeService;

    
    // LOGIN
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }


    // REGISTER
   
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Validate username
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }

        // Validate email
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

       
        // 1. CREATE USER (AUTH TABLE)
       
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(Role.valueOf(request.getRole()));
        user.setActive(true);

        User savedUser = userService.registerUser(user);

       
        // 2. CREATE EMPLOYEE (PROFILE TABLE)
       
        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhoneNumber(request.getPhoneNumber());

        // optional defaults (safe initialization)
        employee.setAnnualLeaveBalance(0);
        employee.setSickLeaveBalance(0);
        employee.setCasualLeaveBalance(0);

        employeeService.save(employee);

        return ResponseEntity.ok(savedUser);
    }
}