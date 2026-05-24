import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMyLeaves, cancelLeave } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaTimes, FaPlus } from 'react-icons/fa';
import moment from 'moment';

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [employeeId, setEmployeeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    resolveEmployeeAndFetch();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [statusFilter, leaves]);

  const resolveEmployeeAndFetch = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      setEmployeeId(employee.id);
      const data = await getMyLeaves(employee.id);
      setLeaves(data);
      setFilteredLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    if (!employeeId) return;
    try {
      const data = await getMyLeaves(employeeId);
      setLeaves(data);
      setFilteredLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    }
  };

  const filterLeaves = () => {
    if (statusFilter === 'ALL') {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === statusFilter));
    }
  };

  const handleCancel = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave?')) {
      try {
        await cancelLeave(leaveId);
        toast.success('Leave cancelled successfully');
        fetchLeaves();
      } catch (error) {
        toast.error('Failed to cancel leave');
      }
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

  const canCancel = (leave) => {
    return leave.status === 'PENDING' && moment(leave.startDate).isAfter(moment());
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>My Leave Applications</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => navigate('/leaves/apply')}>
            <FaPlus className="me-2" />
            Apply New Leave
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Leaves</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType.replace('_', ' ')}</td>
                    <td>{moment(leave.startDate).format('DD/MM/YYYY')}</td>
                    <td>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                    <td>{leave.numberOfDays}</td>
                    <td>{getStatusBadge(leave.status)}</td>
                    <td>{moment(leave.createdAt).format('DD/MM/YYYY')}</td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => navigate(`/leaves/${leave.id}`)}
                      >
                        <FaEye />
                      </Button>
                      {canCancel(leave) && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleCancel(leave.id)}
                        >
                          <FaTimes />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No leave applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LeaveList;
