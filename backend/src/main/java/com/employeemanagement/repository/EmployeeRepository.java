package com.employeemanagement.repository;

import com.employeemanagement.model.Employee;
import com.employeemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUser(User user);
    
    @Query("SELECT e FROM Employee e WHERE e.department.id = :departmentId")
    List<Employee> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findByManagerId(@Param("managerId") Long managerId);
    
    @Query("SELECT e FROM Employee e WHERE e.department.id = :deptId AND e.id != :employeeId")
    List<Employee> findOtherEmployeesInDepartment(@Param("deptId") Long deptId, @Param("employeeId") Long employeeId);
}
