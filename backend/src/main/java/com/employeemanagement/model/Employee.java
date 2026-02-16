
package com.employeemanagement.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String phoneNumber;
    private String address;
    private String emergencyContact;
    private String emergencyPhone;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "employee")
    private List<Leave> leaves = new ArrayList<>();

    private double annualLeaveBalance = LeaveType.PAID_LEAVE.getDefaultDays();
    private double sickLeaveBalance = LeaveType.SICK_LEAVE.getDefaultDays();
    private double casualLeaveBalance = LeaveType.CASUAL_LEAVE.getDefaultDays();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}