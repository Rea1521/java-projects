import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaClipboardList,
  FaUserTie,
  FaSun,
  FaUserPlus
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    {
      path: '/leaves/apply',
      icon: <FaCalendarAlt />,
      label: 'Apply Leave',
      roles: ['EMPLOYEE', 'MANAGER']
    },
    {
      path: '/leaves',
      icon: <FaClipboardList />,
      label: 'My Leaves',
      roles: ['EMPLOYEE', 'MANAGER']
    },
    {
      path: '/leaves/balance',
      icon: <FaCalendarAlt />,
      label: 'Leave Balance',
      roles: ['EMPLOYEE', 'MANAGER']
    },
    {
      path: '/leaves/pending',
      icon: <FaUserTie />,
      label: 'Pending Approvals',
      roles: ['MANAGER', 'ADMIN']
    },
    {
      path: '/employees',
      icon: <FaUsers />,
      label: 'Employees',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      path: '/employees/new',
      icon: <FaUserPlus />,
      label: 'Add Employee',
      roles: ['ADMIN']
    },
    {
      path: '/departments',
      icon: <FaBuilding />,
      label: 'Departments',
      roles: ['ADMIN']
    },
    {
      path: '/holidays',
      icon: <FaSun />,
      label: 'Holidays',
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    {
      path: '/reports/analytics',
      icon: <FaChartBar />,
      label: 'Analytics',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      path: '/reports/audit',
      icon: <FaClipboardList />,
      label: 'Audit Logs',
      roles: ['ADMIN']
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="bg-light sidebar" style={{ minHeight: '100vh' }}>
      <Nav className="flex-column p-3">
        <Nav.Item className="mb-3">
          <h5 className="text-primary">Menu</h5>
        </Nav.Item>
        {filteredMenu.map((item, index) => (
          <Nav.Item key={index} className="mb-2">
            <Nav.Link
              as={Link}
              to={item.path}
              active={isActive(item.path)}
              className="text-dark"
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
