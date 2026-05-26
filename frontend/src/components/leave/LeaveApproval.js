import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Badge, Button, Card, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getPendingLeaves, approveLeave, rejectLeave } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import moment from 'moment';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [leaves, setLeaves]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction]               = useState('');
  const [comments, setComments]           = useState('');
  const [reason, setReason]               = useState('');
  // Store employeeId in a ref AND state so fetchPendingLeaves always
  // has the current value without a stale-closure problem
  const [managerId, setManagerId]         = useState(null);
  const managerIdRef = React.useRef(null);

  useEffect(() => { resolveAndFetch(); }, []);

  const resolveAndFetch = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      managerIdRef.current = employee.id;
      setManagerId(employee.id);
      const data = await getPendingLeaves(employee.id);
      setLeaves(data);
    } catch {
      toast.error('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  // Use the ref so this function never closes over a stale managerId
  const fetchPendingLeaves = useCallback(async () => {
    const id = managerIdRef.current;
    if (!id) return;
    try {
      const data = await getPendingLeaves(id);
      setLeaves(data);
    } catch {
      toast.error('Failed to refresh leaves');
    }
  }, []);

  const handleApprove = async () => {
    try {
      await approveLeave(selectedLeave.id, comments);
      toast.success('Leave approved successfully');
      handleCloseModal();
      fetchPendingLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectLeave(selectedLeave.id, reason);
      toast.success('Leave rejected');
      handleCloseModal();
      fetchPendingLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject leave');
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

  const getStatusBadge = (status) => {
    const map = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'secondary' };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Pending Leave Approvals</h2>
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Employee</th><th>Department</th><th>Leave Type</th>
                  <th>Start</th><th>End</th><th>Days</th>
                  <th>Reason</th><th>Applied On</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-4">No pending applications</td></tr>
                ) : (
                  leaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.employeeName}</td>
                      <td>{leave.department || 'N/A'}</td>
                      <td>{leave.leaveType?.replace(/_/g, ' ')}</td>
                      <td>{moment(leave.startDate).format('DD/MM/YYYY')}</td>
                      <td>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>{leave.reason}</td>
                      <td>{leave.createdAt ? moment(leave.createdAt).format('DD/MM/YYYY') : '—'}</td>
                      <td>
                        <Button variant="success" size="sm" className="me-2"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(leave, 'approve'); }}>
                          <FaCheck /> Approve
                        </Button>
                        <Button variant="danger" size="sm"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(leave, 'reject'); }}>
                          <FaTimes /> Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Approve / Reject modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{action === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <>
              <p>
                <strong>Employee:</strong> {selectedLeave.employeeName}<br />
                <strong>Type:</strong> {selectedLeave.leaveType?.replace(/_/g, ' ')}<br />
                <strong>Duration:</strong> {moment(selectedLeave.startDate).format('DD/MM/YYYY')} → {moment(selectedLeave.endDate).format('DD/MM/YYYY')}<br />
                <strong>Days:</strong> {selectedLeave.numberOfDays}<br />
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
              {action === 'approve' ? (
                <Form.Group>
                  <Form.Label>Comments (optional)</Form.Label>
                  <Form.Control as="textarea" rows={3} value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Add any approval comments..." />
                </Form.Group>
              ) : (
                <Form.Group>
                  <Form.Label>Rejection Reason *</Form.Label>
                  <Form.Control as="textarea" rows={3} value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Required — explain why this leave is rejected" required />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant={action === 'approve' ? 'success' : 'danger'}
            onClick={action === 'approve' ? handleApprove : handleReject}>
            {action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveApproval;
