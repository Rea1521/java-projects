import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getDepartmentById, createDepartment, updateDepartment } from '../../services/departmentService';
import { getAllEmployees } from '../../services/employeeService';
import { toast } from 'react-toastify';

const DepartmentSchema = Yup.object().shape({
  name: Yup.string().required('Department name is required'),
  description: Yup.string(),
  managerId: Yup.number().nullable()
});

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    managerId: ''
  });

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      // Filter only managers and admins
      const managers = data.filter(emp => emp.role === 'MANAGER' || emp.role === 'ADMIN');
      setEmployees(managers);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const data = await getDepartmentById(id);
      setInitialValues({
        name: data.name || '',
        description: data.description || '',
        managerId: data.managerId || ''
      });
    } catch (error) {
      toast.error('Failed to fetch department details');
      navigate('/departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await updateDepartment(id, values);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(values);
        toast.success('Department created successfully');
      }
      navigate('/departments');
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
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              {id ? 'Edit Department' : 'Add New Department'}
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={DepartmentSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter department description..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Department Manager</Form.Label>
                      <Form.Select
                        name="managerId"
                        value={values.managerId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="">Select Manager (Optional)</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} - {emp.role}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Only employees with Manager or Admin role are shown
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/departments')}
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

export default DepartmentForm;
