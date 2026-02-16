import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getEmployeesByManager } from '../../services/employeeService';
import { getManagerPendingLeaves } from '../../services/leaveService';
import { getDepartmentEmployees } from '../../services/departmentService';
import moment from 'moment';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teamMembers: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Assuming we have the manager's employee ID
      const managerId = 1; // This should come from user context
      const [team, pendingLeaves] = await Promise.all([
        getEmployeesByManager(managerId),
        getManagerPendingLeaves(managerId)
      ]);

      setStats({
        teamMembers: team.length,
        pendingLeaves: pendingLeaves.length,
        approvedLeaves: pendingLeaves.filter(l => l.status === 'APPROVED').length,
        rejectedLeaves: pendingLeaves.filter(l => l.status === 'REJECTED').length
      });

      setRecentLeaves(pendingLeaves.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

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
      <h2 className="mb-4">Manager Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Team Members</h6>
                  <h2>{stats.teamMembers}</h2>
                </div>
                <FaUsers size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-warning mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Pending Approvals</h6>
                  <h2>{stats.pendingLeaves}</h2>
                </div>
                <FaClock size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-success mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Approved</h6>
                  <h2>{stats.approvedLeaves}</h2>
                </div>
                <FaCheckCircle size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-info mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Team Performance</h6>
                  <h2>85%</h2>
                </div>
                <FaChartBar size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Leave Applications</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {recentLeaves.map(leave => (
                <ListGroup.Item key={leave.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{leave.employeeName}</strong>
                      <br />
                      <small className="text-muted">
                        {leave.leaveType} - {moment(leave.startDate).format('DD/MM/YYYY')} to {moment(leave.endDate).format('DD/MM/YYYY')}
                      </small>
                    </div>
                    <div>
                      {getStatusBadge(leave.status)}
                      <Link to={`/leaves/${leave.id}`} className="btn btn-sm btn-outline-primary ms-2">
                        Review
                      </Link>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
              {recentLeaves.length === 0 && (
                <ListGroup.Item className="text-muted">
                  No pending leave applications
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action as={Link} to="/leaves/pending">
                View Pending Approvals
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/team/schedule">
                Team Schedule
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/reports/analytics">
                Team Analytics
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/team/attendance">
                Attendance Report
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Team Overview</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Team Members:</strong> {stats.teamMembers}</p>
              <p><strong>On Leave Today:</strong> 2</p>
              <p><strong>Upcoming Leaves:</strong> 5</p>
              <p><strong>Team Availability:</strong> 85%</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerDashboard;
