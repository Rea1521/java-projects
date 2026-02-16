import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Form as BootstrapForm, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding } from 'react-icons/fa';
import { register } from '../../services/authService';
import { toast } from 'react-toastify';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phoneNumber: Yup.string(),
  department: Yup.string()
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const { confirmPassword, ...userData } = values;
      await register(userData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">Create an Account</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: '',
                  phoneNumber: '',
                  department: '',
                  role: 'EMPLOYEE'
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <Row>
                      <Col md={6}>
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>
                            <FaUser className="me-2" />
                            First Name *
                          </BootstrapForm.Label>
                          <Field
                            type="text"
                            name="firstName"
                            as={BootstrapForm.Control}
                            placeholder="Enter first name"
                            isInvalid={touched.firstName && errors.firstName}
                          />
                          <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                        </BootstrapForm.Group>
                      </Col>
                      <Col md={6}>
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>Last Name *</BootstrapForm.Label>
                          <Field
                            type="text"
                            name="lastName"
                            as={BootstrapForm.Control}
                            placeholder="Enter last name"
                            isInvalid={touched.lastName && errors.lastName}
                          />
                          <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                        </BootstrapForm.Group>
                      </Col>
                    </Row>

                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaUser className="me-2" />
                        Username *
                      </BootstrapForm.Label>
                      <Field
                        type="text"
                        name="username"
                        as={BootstrapForm.Control}
                        placeholder="Choose a username"
                        isInvalid={touched.username && errors.username}
                      />
                      <ErrorMessage name="username" component="div" className="invalid-feedback" />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaEnvelope className="me-2" />
                        Email *
                      </BootstrapForm.Label>
                      <Field
                        type="email"
                        name="email"
                        as={BootstrapForm.Control}
                        placeholder="Enter your email"
                        isInvalid={touched.email && errors.email}
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </BootstrapForm.Group>

                    <Row>
                      <Col md={6}>
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>
                            <FaLock className="me-2" />
                            Password *
                          </BootstrapForm.Label>
                          <Field
                            type="password"
                            name="password"
                            as={BootstrapForm.Control}
                            placeholder="Enter password"
                            isInvalid={touched.password && errors.password}
                          />
                          <ErrorMessage name="password" component="div" className="invalid-feedback" />
                        </BootstrapForm.Group>
                      </Col>
                      <Col md={6}>
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>Confirm Password *</BootstrapForm.Label>
                          <Field
                            type="password"
                            name="confirmPassword"
                            as={BootstrapForm.Control}
                            placeholder="Confirm password"
                            isInvalid={touched.confirmPassword && errors.confirmPassword}
                          />
                          <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                        </BootstrapForm.Group>
                      </Col>
                    </Row>

                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaPhone className="me-2" />
                        Phone Number
                      </BootstrapForm.Label>
                      <Field
                        type="text"
                        name="phoneNumber"
                        as={BootstrapForm.Control}
                        placeholder="Enter phone number"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaBuilding className="me-2" />
                        Department
                      </BootstrapForm.Label>
                      <Field
                        as="select"
                        name="department"
                        className="form-control"
                      >
                        <option value="">Select Department</option>
                        <option value="IT">Information Technology</option>
                        <option value="HR">Human Resources</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                      </Field>
                    </BootstrapForm.Group>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Registering...
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div className="small">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
