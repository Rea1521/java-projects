import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboards
import AdminDashboard from './components/dashboard/AdminDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';

// Leave
import LeaveApplication from './components/leave/LeaveApplication';
import LeaveList from './components/leave/LeaveList';
import LeaveApproval from './components/leave/LeaveApproval';
import LeaveBalance from './components/leave/LeaveBalance';

// Employee
import EmployeeList from './components/employee/EmployeeList';
import EmployeeForm from './components/employee/EmployeeForm';
import EmployeeProfile from './components/employee/EmployeeProfile';

// Department / Holiday
import DepartmentList from './components/department/DepartmentList';
import HolidayList from './components/holiday/HolidayList';

// Reports
import LeaveAnalytics from './components/reports/LeaveAnalytics';
import AuditLogs from './components/reports/AuditLogs';

// Common
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {user && <Navbar />}
      <div className={user ? 'container-fluid py-4' : ''}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard — role-based rendering */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              {user?.role === 'ADMIN' ? <AdminDashboard /> :
               user?.role === 'MANAGER' ? <ManagerDashboard /> :
               <EmployeeDashboard />}
            </PrivateRoute>
          } />

          {/* Leave routes */}
          <Route path="/leaves/apply" element={
            <PrivateRoute>
              <LeaveApplication />
            </PrivateRoute>
          } />
          <Route path="/leaves/pending" element={
            <PrivateRoute roles={['ADMIN', 'MANAGER']}>
              <LeaveApproval />
            </PrivateRoute>
          } />
          <Route path="/leaves/balance" element={
            <PrivateRoute>
              <LeaveBalance />
            </PrivateRoute>
          } />
          {/* /leaves must come AFTER specific /leaves/* paths */}
          <Route path="/leaves" element={
            <PrivateRoute>
              <LeaveList />
            </PrivateRoute>
          } />

          {/* Employee routes — specific paths before parameterised */}
          <Route path="/employees/new" element={
            <PrivateRoute roles={['ADMIN']}>
              <EmployeeForm />
            </PrivateRoute>
          } />
          <Route path="/employees/:id/edit" element={
            <PrivateRoute roles={['ADMIN']}>
              <EmployeeForm />
            </PrivateRoute>
          } />
          <Route path="/employees/:id" element={
            <PrivateRoute roles={['ADMIN', 'MANAGER', 'EMPLOYEE']}>
              <EmployeeProfile />
            </PrivateRoute>
          } />
          <Route path="/employees" element={
            <PrivateRoute roles={['ADMIN', 'MANAGER']}>
              <EmployeeList />
            </PrivateRoute>
          } />

          {/* Profile (logged-in user's own profile) */}
          <Route path="/profile" element={
            <PrivateRoute>
              <EmployeeProfile />
            </PrivateRoute>
          } />

          {/* Department & Holiday */}
          <Route path="/departments" element={
            <PrivateRoute roles={['ADMIN']}>
              <DepartmentList />
            </PrivateRoute>
          } />
          <Route path="/holidays" element={
            <PrivateRoute>
              <HolidayList />
            </PrivateRoute>
          } />

          {/* Reports */}
          <Route path="/reports/analytics" element={
            <PrivateRoute roles={['ADMIN', 'MANAGER']}>
              <LeaveAnalytics />
            </PrivateRoute>
          } />
          <Route path="/reports/audit" element={
            <PrivateRoute roles={['ADMIN']}>
              <AuditLogs />
            </PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
