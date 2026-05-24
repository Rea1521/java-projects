package com.employeemanagement.dto;

import com.employeemanagement.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String department;
}
