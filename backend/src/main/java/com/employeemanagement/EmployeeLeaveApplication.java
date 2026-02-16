package com.employeemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EmployeeLeaveApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmployeeLeaveApplication.class, args);
    }
}
