import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployeeById, updateEmployee, getAllEmployees } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import { toast } from 'react-toastify';

const EmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string(),
  dateOfBirth: Yup.date(),
  hireDate: Yup.date(),
  address: Yup.string(),
  emergencyContact: Yup.string(),
  emergencyPhone: Yup.string(),
  departmentId: Yup.number(),
  managerId: Yup.number(),
  annualLeaveBalance: Yup.number().min(0, 'Balance cannot be negative'),
  sickLeaveBalance: Yup.number().min(0, 'Balance cannot be negative'),
  casualLeaveBalance: Yup.number().min(0, 'Balance cannot be negative')
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    hireDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    departmentId: '',
    managerId: '',
    annualLeaveBalance: 15,
    sickLeaveBalance: 12,
    casualLeaveBalance: 10,
    role: 'EMPLOYEE',
    active: true
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchManagers = async () => {
    try {
      const data = await getAllEmployees();
      setManagers(data.filter(emp => emp.role === 'MANAGER' || emp.role === 'ADMIN'));
    } catch (error) {
      toast.error('Failed to fetch managers');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeById(id);
      setInitialValues(data);
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await updateEmployee(id, values);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(values);
        toast.success('Employee created successfully');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
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
    <Container>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              {id ? 'Edit Employee' : 'Add New Employee'}
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={EmployeeSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <Field
                            type="text"
                            name="firstName"
                            className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name *</Form.Label>
                          <Field
                            type="text"
                            name="lastName"
                            className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email *</Form.Label>
                          <Field
                            type="email"
                            name="email"
                            className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="email" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Field
                            type="text"
                            name="phoneNumber"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date of Birth</Form.Label>
                          <Field
                            type="date"
                            name="dateOfBirth"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hire Date</Form.Label>
                          <Field
                            type="date"
                            name="hireDate"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Field
                        as="textarea"
                        name="address"
                        rows="2"
                        className="form-control"
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Emergency Contact</Form.Label>
                          <Field
                            type="text"
                            name="emergencyContact"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Emergency Phone</Form.Label>
                          <Field
                            type="text"
                            name="emergencyPhone"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Field
                            as="select"
                            name="departmentId"
                            className="form-control"
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </Field>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Manager</Form.Label>
                          <Field
                            as="select"
                            name="managerId"
                            className="form-control"
                          >
                            <option value="">No Manager</option>
                            {managers.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} — {emp.role}
                              </option>
                            ))}
                          </Field>
                        </Form.Group>
                      </Col>
                    </Row>

                   
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Field
                            as="select"
                            name="role"
                            className="form-control"
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </Field>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Annual Leave Balance</Form.Label>
                          <Field
                            type="number"
                            name="annualLeaveBalance"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sick Leave Balance</Form.Label>
                          <Field
                            type="number"
                            name="sickLeaveBalance"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Casual Leave Balance</Form.Label>
                          <Field
                            type="number"
                            name="casualLeaveBalance"
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Active Employee"
                        name="active"
                        checked={values.active}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/employees')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : (id ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeForm;
