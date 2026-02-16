@echo off
REM Make sure we are inside employee-leave-management
cd /d %~dp0

REM ===== Backend Structure =====
mkdir backend\src\main\java\com\employeemanagement\config
mkdir backend\src\main\java\com\employeemanagement\controller
mkdir backend\src\main\java\com\employeemanagement\model
mkdir backend\src\main\java\com\employeemanagement\repository
mkdir backend\src\main\java\com\employeemanagement\service
mkdir backend\src\main\java\com\employeemanagement\serviceimpl
mkdir backend\src\main\java\com\employeemanagement\dto
mkdir backend\src\main\java\com\employeemanagement\security
mkdir backend\src\main\java\com\employeemanagement\exception
mkdir backend\src\main\resources\db\migration
mkdir backend\src\test

REM Backend main files
echo.> backend\src\main\java\com\employeemanagement\EmployeeLeaveApplication.java
echo.> backend\pom.xml
echo.> backend\src\main\resources\application.properties
echo.> backend\src\main\resources\db\migration\V1__create_tables.sql

REM Config files
echo.> backend\src\main\java\com\employeemanagement\config\SecurityConfig.java
echo.> backend\src\main\java\com\employeemanagement\config\WebConfig.java
echo.> backend\src\main\java\com\employeemanagement\config\DataInitializer.java

REM Controller files
echo.> backend\src\main\java\com\employeemanagement\controller\AuthController.java
echo.> backend\src\main\java\com\employeemanagement\controller\EmployeeController.java
echo.> backend\src\main\java\com\employeemanagement\controller\LeaveController.java
echo.> backend\src\main\java\com\employeemanagement\controller\DepartmentController.java
echo.> backend\src\main\java\com\employeemanagement\controller\HolidayController.java

REM Model files
echo.> backend\src\main\java\com\employeemanagement\model\User.java
echo.> backend\src\main\java\com\employeemanagement\model\Employee.java
echo.> backend\src\main\java\com\employeemanagement\model\Leave.java
echo.> backend\src\main\java\com\employeemanagement\model\Department.java
echo.> backend\src\main\java\com\employeemanagement\model\Holiday.java
echo.> backend\src\main\java\com\employeemanagement\model\AuditLog.java
echo.> backend\src\main\java\com\employeemanagement\model\Role.java
echo.> backend\src\main\java\com\employeemanagement\model\LeaveType.java

REM Repository files
echo.> backend\src\main\java\com\employeemanagement\repository\UserRepository.java
echo.> backend\src\main\java\com\employeemanagement\repository\EmployeeRepository.java
echo.> backend\src\main\java\com\employeemanagement\repository\LeaveRepository.java
echo.> backend\src\main\java\com\employeemanagement\repository\DepartmentRepository.java
echo.> backend\src\main\java\com\employeemanagement\repository\HolidayRepository.java
echo.> backend\src\main\java\com\employeemanagement\repository\AuditLogRepository.java

REM Service files
echo.> backend\src\main\java\com\employeemanagement\service\UserService.java
echo.> backend\src\main\java\com\employeemanagement\service\LeaveService.java
echo.> backend\src\main\java\com\employeemanagement\service\EmployeeService.java
echo.> backend\src\main\java\com\employeemanagement\service\DepartmentService.java
echo.> backend\src\main\java\com\employeemanagement\service\HolidayService.java
echo.> backend\src\main\java\com\employeemanagement\service\AuditService.java

REM ServiceImpl files
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\UserServiceImpl.java
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\LeaveServiceImpl.java
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\EmployeeServiceImpl.java
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\DepartmentServiceImpl.java
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\HolidayServiceImpl.java
echo.> backend\src\main\java\com\employeemanagement\serviceimpl\AuditServiceImpl.java

REM DTO files
echo.> backend\src\main\java\com\employeemanagement\dto\LoginRequest.java
echo.> backend\src\main\java\com\employeemanagement\dto\LoginResponse.java
echo.> backend\src\main\java\com\employeemanagement\dto\LeaveRequest.java
echo.> backend\src\main\java\com\employeemanagement\dto\LeaveResponse.java
echo.> backend\src\main\java\com\employeemanagement\dto\EmployeeDTO.java
echo.> backend\src\main\java\com\employeemanagement\dto\DepartmentDTO.java

REM Security files
echo.> backend\src\main\java\com\employeemanagement\security\JwtAuthenticationFilter.java
echo.> backend\src\main\java\com\employeemanagement\security\JwtUtils.java
echo.> backend\src\main\java\com\employeemanagement\security\UserDetailsServiceImpl.java

REM Exception files
echo.> backend\src\main\java\com\employeemanagement\exception\GlobalExceptionHandler.java
echo.> backend\src\main\java\com\employeemanagement\exception\ResourceNotFoundException.java
echo.> backend\src\main\java\com\employeemanagement\exception\UnauthorizedException.java

REM ===== Frontend Structure =====
mkdir frontend\public\icons
mkdir frontend\src\components\common
mkdir frontend\src\components\auth
mkdir frontend\src\components\employee
mkdir frontend\src\components\leave
mkdir frontend\src\components\department
mkdir frontend\src\components\holiday
mkdir frontend\src\components\dashboard
mkdir frontend\src\components\reports
mkdir frontend\src\services
mkdir frontend\src\utils
mkdir frontend\src\context
mkdir frontend\src\styles

REM Frontend main files
echo.> frontend\public\index.html
echo.> frontend\public\manifest.json
echo.> frontend\src\index.js
echo.> frontend\src\App.js
echo.> frontend\src\index.css
echo.> frontend\src\context\AuthContext.js
echo.> frontend\src\styles\main.css
echo.> frontend\package.json
echo.> frontend\.env

REM Frontend components
echo.> frontend\src\components\common\Navbar.js
echo.> frontend\src\components\common\Sidebar.js
echo.> frontend\src\components\common\Footer.js
echo.> frontend\src\components\common\PrivateRoute.js
echo.> frontend\src\components\auth\Login.js
echo.> frontend\src\components\auth\Register.js
echo.> frontend\src\components\employee\EmployeeList.js
echo.> frontend\src\components\employee\EmployeeForm.js
echo.> frontend\src\components\employee\EmployeeProfile.js
echo.> frontend\src\components\leave\LeaveApplication.js
echo.> frontend\src\components\leave\LeaveList.js
echo.> frontend\src\components\leave\LeaveApproval.js
echo.> frontend\src\components\leave\LeaveBalance.js
echo.> frontend\src\components\department\DepartmentList.js
echo.> frontend\src\components\department\DepartmentForm.js
echo.> frontend\src\components\holiday\HolidayList.js
echo.> frontend\src\components\holiday\HolidayForm.js
echo.> frontend\src\components\dashboard\AdminDashboard.js
echo.> frontend\src\components\dashboard\ManagerDashboard.js
echo.> frontend\src\components\dashboard\EmployeeDashboard.js
echo.> frontend\src\components\reports\LeaveAnalytics.js
echo.> frontend\src\components\reports\AuditLogs.js

REM Frontend services
echo.> frontend\src\services\api.js
echo.> frontend\src\services\authService.js
echo.> frontend\src\services\employeeService.js
echo.> frontend\src\services\leaveService.js
echo.> frontend\src\services\departmentService.js

REM Frontend utils
echo.> frontend\src\utils\dateUtils.js
echo.> frontend\src\utils\validators.js

REM ===== Root project files =====
echo.> docker-compose.yml
echo.> Dockerfile.backend
echo.> Dockerfile.frontend
echo.> .dockerignore
echo.> .gitignore
echo.> render.yaml
echo.> README.md

echo All subfolders and files created successfully!
pause