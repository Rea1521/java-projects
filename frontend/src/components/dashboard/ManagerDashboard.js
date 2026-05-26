import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getEmployeesByManager } from '../../services/employeeService';
import { getManagerPendingLeaves, getAllLeaves } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import moment from 'moment';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teamMembers: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      const managerId = employee.id;

      // Fetch team AND all pending leaves in parallel
      const [team, pendingLeaves] = await Promise.all([
        getEmployeesByManager(managerId),
        getManagerPendingLeaves(managerId),
      ]);

      // Fetch ALL leaves for this manager's team to get accurate approved/rejected counts
      // We do this by getting each team member's leaves — or use /leaves/all if admin
      // For simplicity: fetch all leaves and filter by team member IDs
      const teamIds = new Set(team.map(m => m.id));

      let allTeamLeaves = [];
      try {
        const all = await getAllLeaves();
        allTeamLeaves = all.filter(l => teamIds.has(l.employeeId));
      } catch {
        // If not admin, fall back to pending only
        allTeamLeaves = pendingLeaves;
      }

      setStats({
        teamMembers:    team.length,
        pendingLeaves:  pendingLeaves.length,
        approvedLeaves: allTeamLeaves.filter(l => l.status === 'APPROVED').length,
        rejectedLeaves: allTeamLeaves.filter(l => l.status === 'REJECTED').length,
      });

      // Show all recent leaves (pending + recently actioned) — not just pending
      const recent = [...allTeamLeaves]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
      setRecentLeaves(recent);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'secondary' };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return (
    <Container className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
    </Container>
  );

  return (
    <Container fluid>
      <h2 className="mb-4">Manager Dashboard</h2>

      <Row className="mb-4">
        {[
          { label: 'Team Members',      value: stats.teamMembers,    bg: 'primary', icon: <FaUsers size={40} /> },
          { label: 'Pending Approvals', value: stats.pendingLeaves,  bg: 'warning', icon: <FaClock size={40} /> },
          { label: 'Approved',          value: stats.approvedLeaves, bg: 'success', icon: <FaCheckCircle size={40} /> },
          { label: 'Rejected',          value: stats.rejectedLeaves, bg: 'danger',  icon: <FaTimesCircle size={40} /> },
        ].map(card => (
          <Col md={3} key={card.label}>
            <Card className={`text-white bg-${card.bg} mb-3`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{card.label}</h6>
                    <h2>{card.value}</h2>
                  </div>
                  {card.icon}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Leave Applications</h5>
              <Link to="/leaves/pending" className="btn btn-sm btn-outline-primary">
                View All Pending
              </Link>
            </Card.Header>
            <ListGroup variant="flush">
              {recentLeaves.length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-3">
                  No leave applications found
                </ListGroup.Item>
              ) : (
                recentLeaves.map(leave => (
                  <ListGroup.Item key={leave.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{leave.employeeName}</strong>
                        <br />
                        <small className="text-muted">
                          {leave.leaveType?.replace(/_/g, ' ')} ·{' '}
                          {moment(leave.startDate).format('DD/MM/YYYY')} → {moment(leave.endDate).format('DD/MM/YYYY')} ·{' '}
                          {leave.numberOfDays} day(s)
                        </small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getStatusBadge(leave.status)}
                        {leave.status === 'PENDING' && (
                          <Link to="/leaves/pending" className="btn btn-sm btn-outline-warning">
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header><h5 className="mb-0">Quick Actions</h5></Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action as={Link} to="/leaves/pending">
                📋 View Pending Approvals
                {stats.pendingLeaves > 0 && (
                  <Badge bg="warning" className="ms-2">{stats.pendingLeaves}</Badge>
                )}
              </ListGroup.Item>
              <ListGroup.Item action as={Link} to="/employees">👥 Team Members</ListGroup.Item>
              <ListGroup.Item action as={Link} to="/leaves/apply">📅 Apply for Leave</ListGroup.Item>
              <ListGroup.Item action as={Link} to="/reports/analytics">📊 Analytics</ListGroup.Item>
            </ListGroup>
          </Card>

          <Card>
            <Card.Header><h5 className="mb-0">Team Overview</h5></Card.Header>
            <Card.Body>
              <p><strong>Team Members:</strong> {stats.teamMembers}</p>
              <p><strong>Pending Reviews:</strong> {stats.pendingLeaves}</p>
              <p><strong>Approved This Period:</strong> {stats.approvedLeaves}</p>
              <p><strong>Rejected This Period:</strong> {stats.rejectedLeaves}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerDashboard;
