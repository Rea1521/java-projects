package com.employeemanagement.dto;

import com.employeemanagement.model.LeaveType;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class LeaveRequest {
    @NotNull
    private LeaveType leaveType;
    
    @NotNull
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @NotNull
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private double numberOfDays;
    
    @NotBlank
    private String reason;
}
