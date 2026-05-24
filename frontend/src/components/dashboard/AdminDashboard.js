import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaCalendarAlt, FaChartBar, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { getAllEmployees } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllLeaves } from '../../services/leaveService';
import { getAllHolidays } from '../../services/holidayService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    leaves: 0,
    holidays: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employees, departments, leaves, holidays] = await Promise.all([
        getAllEmployees(),
        getAllDepartments(),
        getAllLeaves(),
        getAllHolidays()
      ]);

      setStats({
        employees: employees.length,
        departments: departments.length,
        leaves: leaves.length,
        holidays: holidays.length,
        pendingLeaves: leaves.filter(l => l.status === 'PENDING').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: 'Employee Management',
      icon: <FaUsers size={30} />,
      description: 'Manage employee profiles, roles, and permissions',
      link: '/employees',
      color: 'primary',
      count: stats.employees
    },
    {
      title: 'Department Management',
      icon: <FaBuilding size={30} />,
      description: 'Organize departments and assign managers',
      link: '/departments',
      color: 'success',
      count: stats.departments
    },
    {
      title: 'Leave Management',
      icon: <FaClipboardList size={30} />,
      description: 'View and manage all leave applications',
      link: '/leaves/pending',
      color: 'info',
      count: stats.leaves
    },
    {
      title: 'Holiday Calendar',
      icon: <FaCalendarAlt size={30} />,
      description: 'Manage company holidays and events',
      link: '/holidays',
      color: 'warning',
      count: stats.holidays
    },
    {
      title: 'Reports & Analytics',
      icon: <FaChartBar size={30} />,
      description: 'View detailed reports and insights',
      link: '/reports/analytics',
      color: 'danger',
      count: null
    },
    {
      title: 'Pending Approvals',
      icon: <FaUserTie size={30} />,
      description: 'Review pending leave applications',
      link: '/leaves/pending',
      color: 'secondary',
      count: stats.pendingLeaves
    }
  ];

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Row className="mb-4">
        {adminModules.map((module, index) => (
          <Col lg={4} md={6} className="mb-4" key={index}>
            <Card className="h-100 shadow-sm dashboard-card">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className={`bg-${module.color} bg-opacity-10 p-3 rounded me-3`}>
                    <div className={`text-${module.color}`}>
                      {module.icon}
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">{module.title}</h5>
                    {module.count !== null && (
                      <span className={`badge bg-${module.color}`}>
                        Total: {module.count}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-muted mb-3">{module.description}</p>
                <Link to={module.link} className={`btn btn-outline-${module.color} w-100`}>
                  Manage
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">System Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6} md={3} className="mb-3">
                  <div className="border rounded p-3 text-center">
                    <h3>{stats.employees}</h3>
                    <small className="text-muted">Total Employees</small>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div className="border rounded p-3 text-center">
                    <h3>{stats.departments}</h3>
                    <small className="text-muted">Departments</small>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div className="border rounded p-3 text-center">
                    <h3>{stats.leaves}</h3>
                    <small className="text-muted">Total Leaves</small>
                  </div>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <div className="border rounded p-3 text-center">
                    <h3>{stats.pendingLeaves}</h3>
                    <small className="text-muted">Pending</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action as={Link} to="/employees/new">
                Add New Employee
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/departments">
                Create Department
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/holidays">
                Add Holiday
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/reports/analytics">
                Generate Report
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
