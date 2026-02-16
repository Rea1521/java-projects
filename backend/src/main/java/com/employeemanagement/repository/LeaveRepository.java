package com.employeemanagement.repository;

import com.employeemanagement.model.Employee;
import com.employeemanagement.model.Leave;
import com.employeemanagement.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployee(Employee employee);
    
    @Query("SELECT l FROM Leave l WHERE l.employee.department.id = :departmentId")
    List<Leave> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT l FROM Leave l WHERE l.employee.manager.id = :managerId")
    List<Leave> findByManagerId(@Param("managerId") Long managerId);
    
    @Query("SELECT l FROM Leave l WHERE l.status = :status")
    List<Leave> findByStatus(@Param("status") Leave.LeaveStatus status);
    
    @Query("SELECT l FROM Leave l WHERE l.employee = :employee AND l.leaveType = :leaveType " +
           "AND l.status = 'APPROVED' AND YEAR(l.startDate) = :year")
    List<Leave> findApprovedLeavesByEmployeeAndYear(@Param("employee") Employee employee, 
                                                     @Param("leaveType") LeaveType leaveType, 
                                                     @Param("year") int year);
    
    @Query("SELECT l FROM Leave l WHERE l.employee = :employee AND l.startDate >= :startDate")
    List<Leave> findFutureLeaves(@Param("employee") Employee employee, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT COUNT(l) > 0 FROM Leave l WHERE l.employee = :employee " +
           "AND l.status != 'REJECTED' AND l.status != 'CANCELLED' " +
           "AND ((l.startDate BETWEEN :startDate AND :endDate) " +
           "OR (l.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN l.startDate AND l.endDate))")
    boolean existsOverlappingLeave(@Param("employee") Employee employee,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}
