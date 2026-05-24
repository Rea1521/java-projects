import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getMyLeaves, getLeaveBalance } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({
    PAID_LEAVE: 0,
    SICK_LEAVE: 0,
    CASUAL_LEAVE: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      const empId = employee.id;

      const [leavesData, paidBalance, sickBalance, casualBalance] = await Promise.all([
        getMyLeaves(empId),
        getLeaveBalance(empId, 'PAID_LEAVE'),
        getLeaveBalance(empId, 'SICK_LEAVE'),
        getLeaveBalance(empId, 'CASUAL_LEAVE')
      ]);
      
      setLeaves(leavesData);
      setBalances({
        PAID_LEAVE: paidBalance,
        SICK_LEAVE: sickBalance,
        CASUAL_LEAVE: casualBalance
      });
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
      REJECTED: 'danger',
      CANCELLED: 'secondary'
    };
    return <Badge bg={variants[status] || 'primary'}>{status}</Badge>;
  };

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
  const rejectedLeaves = leaves.filter(l => l.status === 'REJECTED');

  const chartData = {
    labels: ['Paid Leave', 'Sick Leave', 'Casual Leave'],
    datasets: [
      {
        label: 'Taken',
        data: [
          15 - balances.PAID_LEAVE,
          12 - balances.SICK_LEAVE,
          10 - balances.CASUAL_LEAVE
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Remaining',
        data: [
          balances.PAID_LEAVE,
          balances.SICK_LEAVE,
          balances.CASUAL_LEAVE
        ],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leave Balance Overview',
      },
    },
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Welcome, {user?.username}!</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Total Leaves</h6>
                  <h2>{leaves.length}</h2>
                </div>
                <FaCalendarAlt size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-warning mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Pending</h6>
                  <h2>{pendingLeaves.length}</h2>
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
                  <h2>{approvedLeaves.length}</h2>
                </div>
                <FaCheckCircle size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-danger mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Rejected</h6>
                  <h2>{rejectedLeaves.length}</h2>
                </div>
                <FaTimesCircle size={40} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Leave Balance</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={chartData} options={chartOptions} />
              
              <Row className="mt-4">
                <Col md={4}>
                  <h6>Paid Leave</h6>
                  <ProgressBar now={(balances.PAID_LEAVE / 15) * 100} 
                               label={`${balances.PAID_LEAVE}/15`} 
                               variant="info" />
                </Col>
                <Col md={4}>
                  <h6>Sick Leave</h6>
                  <ProgressBar now={(balances.SICK_LEAVE / 12) * 100} 
                               label={`${balances.SICK_LEAVE}/12`} 
                               variant="warning" />
                </Col>
                <Col md={4}>
                  <h6>Casual Leave</h6>
                  <ProgressBar now={(balances.CASUAL_LEAVE / 10) * 100} 
                               label={`${balances.CASUAL_LEAVE}/10`} 
                               variant="success" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item action as={Link} to="/leaves/apply">
                  Apply for Leave
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/leaves">
                  View My Leaves
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/holidays">
                  View Holidays
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Leaves</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {leaves.slice(0, 5).map(leave => (
                <ListGroup.Item key={leave.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{leave.leaveType}</strong>
                      <br />
                      <small>{leave.startDate} to {leave.endDate}</small>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>
                </ListGroup.Item>
              ))}
              {leaves.length === 0 && (
                <ListGroup.Item className="text-muted">No leaves applied yet</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard;
