package com.employeemanagement.service;

import com.employeemanagement.dto.LoginRequest;
import com.employeemanagement.dto.LoginResponse;
import com.employeemanagement.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.List;
import java.util.Optional;

public interface UserService extends UserDetailsService {
    LoginResponse authenticateUser(LoginRequest loginRequest);
    User registerUser(User user);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findUserById(Long id);  // Add this method
    List<User> findAllUsers();
    User updateUser(Long id, User userDetails);
    void deleteUser(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User getCurrentUser();
}