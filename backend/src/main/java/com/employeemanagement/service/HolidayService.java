package com.employeemanagement.service;

import com.employeemanagement.model.Holiday;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayService {
    Holiday createHoliday(Holiday holiday);
    Holiday updateHoliday(Long id, Holiday holiday);
    void deleteHoliday(Long id);
    Optional<Holiday> getHolidayById(Long id);
    List<Holiday> getAllHolidays();
    List<Holiday> getHolidaysInRange(LocalDate startDate, LocalDate endDate);
    boolean isHoliday(LocalDate date);
    List<Holiday> getUpcomingHolidays(int days);
}
