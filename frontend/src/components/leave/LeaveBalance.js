import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Table } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getLeaveBalance, getMyLeaves } from '../../services/leaveService';
import { FaCalendarAlt, FaHeartbeat, FaUmbrellaBeach } from 'react-icons/fa';
import moment from 'moment';

const LeaveBalance = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState({
    PAID_LEAVE: { total: 15, used: 0, remaining: 15 },
    SICK_LEAVE: { total: 12, used: 0, remaining: 12 },
    CASUAL_LEAVE: { total: 10, used: 0, remaining: 10 }
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const [leaves, paidBalance, sickBalance, casualBalance] = await Promise.all([
        getMyLeaves(),
        getLeaveBalance(user.id, 'PAID_LEAVE'),
        getLeaveBalance(user.id, 'SICK_LEAVE'),
        getLeaveBalance(user.id, 'CASUAL_LEAVE')
      ]);

      // Calculate used leaves
      const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
      
      const paidUsed = approvedLeaves
        .filter(l => l.leaveType === 'PAID_LEAVE')
        .reduce((sum, l) => sum + l.numberOfDays, 0);
      
      const sickUsed = approvedLeaves
        .filter(l => l.leaveType === 'SICK_LEAVE')
        .reduce((sum, l) => sum + l.numberOfDays, 0);
      
      const casualUsed = approvedLeaves
        .filter(l => l.leaveType === 'CASUAL_LEAVE')
        .reduce((sum, l) => sum + l.numberOfDays, 0);

      setBalances({
        PAID_LEAVE: {
          total: 15,
          used: paidUsed,
          remaining: paidBalance
        },
        SICK_LEAVE: {
          total: 12,
          used: sickUsed,
          remaining: sickBalance
        },
        CASUAL_LEAVE: {
          total: 10,
          used: casualUsed,
          remaining: casualBalance
        }
      });

      setLeaveHistory(approvedLeaves.slice(0, 5));
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressVariant = (percentage) => {
    if (percentage < 30) return 'success';
    if (percentage < 60) return 'info';
    if (percentage < 80) return 'warning';
    return 'danger';
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
      <h2 className="mb-4">Leave Balance</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaUmbrellaBeach size={40} className="text-primary mb-3" />
              <h5>Paid Leave</h5>
              <h3>{balances.PAID_LEAVE.remaining} / {balances.PAID_LEAVE.total}</h3>
              <ProgressBar 
                now={(balances.PAID_LEAVE.used / balances.PAID_LEAVE.total) * 100}
                variant={getProgressVariant((balances.PAID_LEAVE.used / balances.PAID_LEAVE.total) * 100)}
                className="mt-3"
              />
              <p className="text-muted mt-2">
                Used: {balances.PAID_LEAVE.used} days
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaHeartbeat size={40} className="text-success mb-3" />
              <h5>Sick Leave</h5>
              <h3>{balances.SICK_LEAVE.remaining} / {balances.SICK_LEAVE.total}</h3>
              <ProgressBar 
                now={(balances.SICK_LEAVE.used / balances.SICK_LEAVE.total) * 100}
                variant={getProgressVariant((balances.SICK_LEAVE.used / balances.SICK_LEAVE.total) * 100)}
                className="mt-3"
              />
              <p className="text-muted mt-2">
                Used: {balances.SICK_LEAVE.used} days
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaCalendarAlt size={40} className="text-info mb-3" />
              <h5>Casual Leave</h5>
              <h3>{balances.CASUAL_LEAVE.remaining} / {balances.CASUAL_LEAVE.total}</h3>
              <ProgressBar 
                now={(balances.CASUAL_LEAVE.used / balances.CASUAL_LEAVE.total) * 100}
                variant={getProgressVariant((balances.CASUAL_LEAVE.used / balances.CASUAL_LEAVE.total) * 100)}
                className="mt-3"
              />
              <p className="text-muted mt-2">
                Used: {balances.CASUAL_LEAVE.used} days
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Leave History</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.leaveType.replace('_', ' ')}</td>
                      <td>{moment(leave.startDate).format('DD/MM/YYYY')}</td>
                      <td>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>
                        <span className={`badge bg-${leave.status === 'APPROVED' ? 'success' : 'warning'}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaveHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        No leave history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeaveBalance;
