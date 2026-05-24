import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getPendingLeaves, approveLeave, rejectLeave } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import moment from 'moment';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    resolveAndFetch();
  }, []);

  const resolveAndFetch = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      setEmployeeId(employee.id);
      const data = await getPendingLeaves(employee.id);
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    if (!employeeId) return;
    try {
      const data = await getPendingLeaves(employeeId);
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch pending leaves');
    }
  };

  const handleApprove = async () => {
    try {
      await approveLeave(selectedLeave.id, comments);
      toast.success('Leave approved successfully');
      handleCloseModal();
      fetchPendingLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!reason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectLeave(selectedLeave.id, reason);
      toast.success('Leave rejected successfully');
      handleCloseModal();
      fetchPendingLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const handleOpenModal = (leave, actionType) => {
    setSelectedLeave(leave);
    setAction(actionType);
    setComments('');
    setReason('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
    setAction('');
    setComments('');
    setReason('');
  };

  const handleSubmit = () => {
    if (action === 'approve') {
      handleApprove();
    } else {
      handleReject();
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

  return (
    <Container fluid>
      <h2 className="mb-4">Pending Leave Approvals</h2>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.employeeName}</td>
                    <td>{leave.department || 'N/A'}</td>
                    <td>{leave.leaveType.replace('_', ' ')}</td>
                    <td>{moment(leave.startDate).format('DD/MM/YYYY')}</td>
                    <td>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                    <td>{leave.numberOfDays}</td>
                    <td>{leave.reason}</td>
                    <td>{moment(leave.createdAt).format('DD/MM/YYYY')}</td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenModal(leave, 'approve')}
                      >
                        <FaCheck />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleOpenModal(leave, 'reject')}
                      >
                        <FaTimes />
                      </Button>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No pending leave applications
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <>
              <p>
                <strong>Employee:</strong> {selectedLeave.employeeName}<br />
                <strong>Leave Type:</strong> {selectedLeave.leaveType.replace('_', ' ')}<br />
                <strong>Duration:</strong> {moment(selectedLeave.startDate).format('DD/MM/YYYY')} to {moment(selectedLeave.endDate).format('DD/MM/YYYY')}<br />
                <strong>Days:</strong> {selectedLeave.numberOfDays}<br />
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
              
              {action === 'approve' ? (
                <Form.Group>
                  <Form.Label>Comments (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments..."
                  />
                </Form.Group>
              ) : (
                <Form.Group>
                  <Form.Label>Rejection Reason *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant={action === 'approve' ? 'success' : 'danger'} 
            onClick={handleSubmit}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveApproval;
