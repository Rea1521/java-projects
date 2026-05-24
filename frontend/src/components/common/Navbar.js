import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const AppNavbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard">
          Employee Leave Management
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">
              <FaTachometerAlt className="me-2" />
              Dashboard
            </Nav.Link>
            
            {user?.role === 'EMPLOYEE' && (
              <>
                <Nav.Link as={Link} to="/leaves/apply">Apply Leave</Nav.Link>
                <Nav.Link as={Link} to="/leaves">My Leaves</Nav.Link>
              </>
            )}
            
            {user?.role === 'MANAGER' && (
              <>
                <Nav.Link as={Link} to="/leaves/pending">Pending Approvals</Nav.Link>
                <Nav.Link as={Link} to="/reports/analytics">Analytics</Nav.Link>
              </>
            )}
            
            {user?.role === 'ADMIN' && (
              <>
                <Nav.Link as={Link} to="/employees">Employees</Nav.Link>
                <Nav.Link as={Link} to="/departments">Departments</Nav.Link>
                <Nav.Link as={Link} to="/holidays">Holidays</Nav.Link>
                <Nav.Link as={Link} to="/reports/analytics">Reports</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <FaUser className="me-2" />
                  {user?.username}
                </span>
              } 
              id="basic-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
