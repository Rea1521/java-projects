import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Form as BootstrapForm, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await login(values);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">Employee Leave Management</h3>
            </Card.Header>
            <Card.Body className="p-4">
              <h4 className="text-center mb-4">Login</h4>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaUser className="me-2" />
                        Username
                      </BootstrapForm.Label>
                      <Field
                        type="text"
                        name="username"
                        as={BootstrapForm.Control}
                        placeholder="Enter username"
                        isInvalid={touched.username && errors.username}
                      />
                      <ErrorMessage name="username" component={BootstrapForm.Control.Feedback} type="invalid" />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        <FaLock className="me-2" />
                        Password
                      </BootstrapForm.Label>
                      <Field
                        type="password"
                        name="password"
                        as={BootstrapForm.Control}
                        placeholder="Enter password"
                        isInvalid={touched.password && errors.password}
                      />
                      <ErrorMessage name="password" component={BootstrapForm.Control.Feedback} type="invalid" />
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
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div className="small">
                <Link to="/register">Need an account? Register here</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
