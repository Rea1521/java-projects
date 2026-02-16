import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import LeaveApplication from './components/leave/LeaveApplication';
import LeaveList from './components/leave/LeaveList';
import LeaveApproval from './components/leave/LeaveApproval';
import EmployeeList from './components/employee/EmployeeList';
import EmployeeForm from './components/employee/EmployeeForm';
import DepartmentList from './components/department/DepartmentList';
import HolidayList from './components/holiday/HolidayList';
import LeaveAnalytics from './components/reports/LeaveAnalytics';
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              {user?.role === 'ADMIN' && <AdminDashboard />}
              {user?.role === 'MANAGER' && <ManagerDashboard />}
              {user?.role === 'EMPLOYEE' && <EmployeeDashboard />}
            </PrivateRoute>
          } />
          
          <Route path="/leaves/apply" element={
            <PrivateRoute>
              <LeaveApplication />
            </PrivateRoute>
          } />
          
          <Route path="/leaves/my-leaves" element={
            <PrivateRoute>
              <LeaveList />
            </PrivateRoute>
          } />
          
          <Route path="/leaves/pending" element={
            <PrivateRoute roles={['MANAGER', 'ADMIN']}>
              <LeaveApproval />
            </PrivateRoute>
          } />
          
          <Route path="/employees" element={
            <PrivateRoute roles={['ADMIN']}>
              <EmployeeList />
            </PrivateRoute>
          } />
          
          <Route path="/employees/new" element={
            <PrivateRoute roles={['ADMIN']}>
              <EmployeeForm />
            </PrivateRoute>
          } />
          
          <Route path="/departments" element={
            <PrivateRoute roles={['ADMIN']}>
              <DepartmentList />
            </PrivateRoute>
          } />
          
          <Route path="/holidays" element={
            <PrivateRoute roles={['ADMIN']}>
              <HolidayList />
            </PrivateRoute>
          } />
          
          <Route path="/reports/analytics" element={
            <PrivateRoute roles={['ADMIN', 'MANAGER']}>
              <LeaveAnalytics />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
