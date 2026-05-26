import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployeeById, updateEmployee, getAllEmployees } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import { toast } from 'react-toastify';

const sanitize = (data) => ({
  firstName:           data.firstName           ?? '',
  lastName:            data.lastName            ?? '',
  email:               data.email               ?? '',
  username:            data.username            ?? '',
  password:            '',
  phoneNumber:         data.phoneNumber         ?? '',
  dateOfBirth:         data.dateOfBirth         ?? '',
  hireDate:            data.hireDate            ?? '',
  address:             data.address             ?? '',
  emergencyContact:    data.emergencyContact    ?? '',
  emergencyPhone:      data.emergencyPhone      ?? '',
  departmentId:        data.departmentId        ?? '',
  managerId:           data.managerId           ?? '',
  annualLeaveBalance:  data.annualLeaveBalance  ?? 15,
  sickLeaveBalance:    data.sickLeaveBalance    ?? 12,
  casualLeaveBalance:  data.casualLeaveBalance  ?? 10,
  role:                data.role                ?? 'EMPLOYEE',
  active:              data.active              ?? true,
});

const buildSchema = (isNew) => Yup.object().shape({
  firstName:  Yup.string().required('First name is required'),
  lastName:   Yup.string().required('Last name is required'),
  email:      Yup.string().email('Invalid email').required('Email is required'),
  username:   isNew ? Yup.string().min(3, 'Min 3 characters').required('Username is required') : Yup.string(),
  password:   isNew ? Yup.string().min(6, 'Min 6 characters').required('Password is required') : Yup.string(),
  annualLeaveBalance:  Yup.number().min(0),
  sickLeaveBalance:    Yup.number().min(0),
  casualLeaveBalance:  Yup.number().min(0),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [departments, setDepartments]   = useState([]);
  const [managers, setManagers]         = useState([]);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [initialValues, setInitialValues] = useState(sanitize({}));
  const submitRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    if (id) fetchEmployee();
  }, [id]);

  const fetchDepartments = async () => {
    try   { setDepartments(await getAllDepartments()); }
    catch { toast.error('Failed to load departments'); }
  };

  const fetchManagers = async () => {
    try {
      const data = await getAllEmployees();
      setManagers(data.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN'));
    } catch { toast.error('Failed to load managers'); }
  };

  const fetchEmployee = async () => {
    try {
      const data = await getEmployeeById(id);
      setInitialValues(sanitize(data));
    } catch {
      toast.error('Failed to fetch employee');
      navigate('/employees');
    } finally { setFetchLoading(false); }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await updateEmployee(id, values);
        toast.success('Employee updated successfully');
      } else {
        // For new employees the backend's /api/auth/register already creates
        // User + Employee together. We re-use that endpoint so role & active
        // are properly stored on the User entity from the start.
        await createEmployee(values);
        toast.success('Employee created successfully');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  if (fetchLoading) return (
    <Container className="text-center py-5">
      <div className="spinner-border text-primary" />
    </Container>
  );

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
                validationSchema={buildSchema(isNew)}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, isSubmitting, submitForm }) => {
                  submitRef.current = submitForm;
                  return (
                    <form onSubmit={e => e.preventDefault()} noValidate>

                      {/* Account credentials — only shown when creating */}
                      {isNew && (
                        <>
                          <Alert variant="info" className="py-2">
                            A login account will be created for this employee.
                          </Alert>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Username *</Form.Label>
                                <Field name="username" type="text"
                                  className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                                  placeholder="Login username" />
                                <ErrorMessage name="username" component="div" className="invalid-feedback" />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Password *</Form.Label>
                                <Field name="password" type="password"
                                  className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                                  placeholder="Min 6 characters" />
                                <ErrorMessage name="password" component="div" className="invalid-feedback" />
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>First Name *</Form.Label>
                            <Field name="firstName" type="text"
                              className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`} />
                            <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Last Name *</Form.Label>
                            <Field name="lastName" type="text"
                              className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`} />
                            <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Field name="email" type="email"
                              className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`} />
                            <ErrorMessage name="email" component="div" className="invalid-feedback" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Field name="phoneNumber" type="text" className="form-control" />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date of Birth</Form.Label>
                            <Field name="dateOfBirth" type="date" className="form-control" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Hire Date</Form.Label>
                            <Field name="hireDate" type="date" className="form-control" />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Field as="textarea" name="address" rows="2" className="form-control" />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Emergency Contact</Form.Label>
                            <Field name="emergencyContact" type="text" className="form-control" />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Emergency Phone</Form.Label>
                            <Field name="emergencyPhone" type="text" className="form-control" />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Field as="select" name="departmentId" className="form-control">
                              <option value="">Select Department</option>
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </Field>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Manager</Form.Label>
                            <Field as="select" name="managerId" className="form-control">
                              <option value="">No Manager</option>
                              {managers.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.firstName} {m.lastName} — {m.role}
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
                            <Field as="select" name="role" className="form-control">
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
                            <Field name="annualLeaveBalance" type="number" className="form-control" />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Sick Leave Balance</Form.Label>
                            <Field name="sickLeaveBalance" type="number" className="form-control" />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Casual Leave Balance</Form.Label>
                            <Field name="casualLeaveBalance" type="number" className="form-control" />
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
                        <Button variant="secondary" onClick={() => navigate('/employees')}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          disabled={isSubmitting}
                          onClick={() => submitRef.current && submitRef.current()}
                        >
                          {isSubmitting ? 'Saving...' : (id ? 'Update' : 'Create Employee')}
                        </Button>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeForm;
