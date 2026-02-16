import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaEnvelope, FaPhone, FaCalendar, FaBuilding, FaUserTie } from 'react-icons/fa';
import { getEmployeeById } from '../../services/employeeService';
import { getEmployeeLeaves } from '../../services/leaveService';
import { toast } from 'react-toastify';
import moment from 'moment';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const [empData, leavesData] = await Promise.all([
        getEmployeeById(id),
        getEmployeeLeaves(id)
      ]);
      setEmployee(empData);
      setLeaves(leavesData);
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate('/employees');
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
      <Button 
        variant="link" 
        className="mb-3" 
        onClick={() => navigate('/employees')}
      >
        <FaArrowLeft className="me-2" />
        Back to Employees
      </Button>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&size=128&background=0D6EFD&color=fff&bold=true`}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '128px', height: '128px' }}
                />
              </div>
              <h3>{employee.firstName} {employee.lastName}</h3>
              <p className="text-muted mb-2">
                <Badge bg={employee.active ? 'success' : 'secondary'}>
                  {employee.active ? 'Active' : 'Inactive'}
                </Badge>
                {' '}
                <Badge bg="info">{employee.role}</Badge>
              </p>
              <p className="mb-1">
                <FaBuilding className="me-2" />
                {employee.departmentName || 'No Department'}
              </p>
              {employee.managerName && (
                <p className="mb-1">
                  <FaUserTie className="me-2" />
                  Reports to: {employee.managerName}
                </p>
              )}
              <Button 
                variant="outline-primary" 
                className="mt-3"
                onClick={() => navigate(`/employees/${id}/edit`)}
              >
                <FaEdit className="me-2" />
                Edit Profile
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Leave Balance</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered size="sm">
                <tbody>
                  <tr>
                    <td>Paid Leave</td>
                    <td className="text-end">{employee.annualLeaveBalance} days</td>
                  </tr>
                  <tr>
                    <td>Sick Leave</td>
                    <td className="text-end">{employee.sickLeaveBalance} days</td>
                  </tr>
                  <tr>
                    <td>Casual Leave</td>
                    <td className="text-end">{employee.casualLeaveBalance} days</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>
                      <FaEnvelope className="me-2" />
                      Email:
                    </strong>{' '}
                    {employee.email}
                  </p>
                  <p>
                    <strong>
                      <FaPhone className="me-2" />
                      Phone:
                    </strong>{' '}
                    {employee.phoneNumber || 'Not provided'}
                  </p>
                  <p>
                    <strong>
                      <FaCalendar className="me-2" />
                      Date of Birth:
                    </strong>{' '}
                    {employee.dateOfBirth ? moment(employee.dateOfBirth).format('DD/MM/YYYY') : 'Not provided'}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Hire Date:</strong>{' '}
                    {employee.hireDate ? moment(employee.hireDate).format('DD/MM/YYYY') : 'Not provided'}
                  </p>
                  <p>
                    <strong>Emergency Contact:</strong>{' '}
                    {employee.emergencyContact || 'Not provided'}
                  </p>
                  <p>
                    <strong>Emergency Phone:</strong>{' '}
                    {employee.emergencyPhone || 'Not provided'}
                  </p>
                </Col>
              </Row>
              {employee.address && (
                <p>
                  <strong>Address:</strong><br />
                  {employee.address}
                </p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave History</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{leave.leaveType.replace('_', ' ')}</td>
                      <td>{moment(leave.startDate).format('DD/MM/YYYY')}</td>
                      <td>{moment(leave.endDate).format('DD/MM/YYYY')}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>{moment(leave.createdAt).format('DD/MM/YYYY')}</td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
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

export default EmployeeProfile;
