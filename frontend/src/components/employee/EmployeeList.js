import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserPlus } from 'react-icons/fa';
import { getAllEmployees, deleteEmployee } from '../../services/employeeService';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = employees.filter(emp => 
        emp.firstName?.toLowerCase().includes(term) ||
        emp.lastName?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.departmentName?.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'danger',
      MANAGER: 'warning',
      EMPLOYEE: 'info'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Management</h2>
        <Link to="/employees/new">
          <Button variant="primary">
            <FaUserPlus className="me-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Leave Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>
                      {emp.firstName} {emp.lastName}
                      {emp.managerName && (
                        <small className="d-block text-muted">
                          Reports to: {emp.managerName}
                        </small>
                      )}
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.departmentName || 'N/A'}</td>
                    <td>{getRoleBadge(emp.role)}</td>
                    <td>
                      <div>Annual: {emp.annualLeaveBalance}</div>
                      <div>Sick: {emp.sickLeaveBalance}</div>
                      <div>Casual: {emp.casualLeaveBalance}</div>
                    </td>
                    <td>
                      <Badge bg={emp.active ? 'success' : 'secondary'}>
                        {emp.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Link to={`/employees/${emp.id}/edit`}>
                        <Button variant="info" size="sm" className="me-2">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No employees found
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

export default EmployeeList;
