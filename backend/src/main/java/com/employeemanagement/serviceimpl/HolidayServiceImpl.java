package com.employeemanagement.serviceimpl;

import com.employeemanagement.exception.ResourceNotFoundException;
import com.employeemanagement.model.Holiday;
import com.employeemanagement.model.User;  // IMPORTANT: Add this import
import com.employeemanagement.repository.HolidayRepository;
import com.employeemanagement.service.AuditService;
import com.employeemanagement.service.HolidayService;
import com.employeemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HolidayServiceImpl implements HolidayService {
    
    private final HolidayRepository holidayRepository;
    private final UserService userService;
    private final AuditService auditService;
    
    @Override
    public Holiday createHoliday(Holiday holiday) {
        User currentUser = userService.getCurrentUser();
        
        // Check if holiday already exists for this date
        if (holidayRepository.existsByDate(holiday.getDate())) {
            throw new IllegalArgumentException("Holiday already exists for date: " + holiday.getDate());
        }
        
        Holiday savedHoliday = holidayRepository.save(holiday);
        auditService.logAction("CREATE_HOLIDAY", "Holiday", savedHoliday.getId(), 
                null, savedHoliday.toString(), currentUser);
        
        return savedHoliday;
    }
    
    @Override
    public Holiday updateHoliday(Long id, Holiday holiday) {
        User currentUser = userService.getCurrentUser();
        
        Holiday existingHoliday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
        
        // Check if date is being changed and if new date already has a holiday
        if (!existingHoliday.getDate().equals(holiday.getDate()) && 
            holidayRepository.existsByDate(holiday.getDate())) {
            throw new IllegalArgumentException("Holiday already exists for date: " + holiday.getDate());
        }
        
        existingHoliday.setName(holiday.getName());
        existingHoliday.setDate(holiday.getDate());
        existingHoliday.setDescription(holiday.getDescription());
        existingHoliday.setRecurring(holiday.isRecurring());
        
        Holiday updatedHoliday = holidayRepository.save(existingHoliday);
        auditService.logAction("UPDATE_HOLIDAY", "Holiday", updatedHoliday.getId(), 
                existingHoliday.toString(), updatedHoliday.toString(), currentUser);
        
        return updatedHoliday;
    }
    
    @Override
    public void deleteHoliday(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
        
        holidayRepository.delete(holiday);
        auditService.logAction("DELETE_HOLIDAY", "Holiday", id, 
                holiday.toString(), null, currentUser);
    }
    
    @Override
    public Optional<Holiday> getHolidayById(Long id) {
        return holidayRepository.findById(id);
    }
    
    @Override
    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }
    
    @Override
    public List<Holiday> getHolidaysInRange(LocalDate startDate, LocalDate endDate) {
        return holidayRepository.findHolidaysInRange(startDate, endDate);
    }
    
    @Override
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByDate(date);
    }
    
    @Override
    public List<Holiday> getUpcomingHolidays(int days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);
        
        return holidayRepository.findHolidaysInRange(today, endDate).stream()
                .filter(holiday -> !holiday.getDate().isBefore(today))
                .collect(Collectors.toList());
    }
}