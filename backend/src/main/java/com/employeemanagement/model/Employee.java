package com.employeemanagement.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
@JoinColumn(name = "user_id", unique = true)
@JsonIgnoreProperties({"employee"})
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
    @JsonIgnore
    private Department department;

    @ManyToOne
@JoinColumn(name = "manager_id")
@JsonIgnore
private Employee manager;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Leave> leaves = new ArrayList<>();

    private double annualLeaveBalance;
    private double sickLeaveBalance;
    private double casualLeaveBalance;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    //  MANUAL GETTERS AND SETTERS 
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Employee getManager() { return manager; }
    public void setManager(Employee manager) { this.manager = manager; }

    public List<Leave> getLeaves() { return leaves; }
    public void setLeaves(List<Leave> leaves) { this.leaves = leaves; }

    public double getAnnualLeaveBalance() { return annualLeaveBalance; }
    public void setAnnualLeaveBalance(double annualLeaveBalance) { this.annualLeaveBalance = annualLeaveBalance; }

    public double getSickLeaveBalance() { return sickLeaveBalance; }
    public void setSickLeaveBalance(double sickLeaveBalance) { this.sickLeaveBalance = sickLeaveBalance; }

    public double getCasualLeaveBalance() { return casualLeaveBalance; }
    public void setCasualLeaveBalance(double casualLeaveBalance) { this.casualLeaveBalance = casualLeaveBalance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}