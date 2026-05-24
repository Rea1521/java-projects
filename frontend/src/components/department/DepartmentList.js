import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Modal, Form, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departmentService';
import { getAllEmployees } from '../../services/employeeService';
import { Formik } from 'formik';
import * as Yup from 'yup';

const DepartmentSchema = Yup.object().shape({
  name: Yup.string().required('Department name is required'),
  description: Yup.string(),
});

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const data = await getAllEmployees();
      setManagers(data.filter(emp => emp.role === 'MANAGER' || emp.role === 'ADMIN'));
    } catch (error) {
      console.error('Failed to fetch managers');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, values);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(values);
        toast.success('Department created successfully');
      }
      fetchDepartments();
      handleCloseModal();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Department Management</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" />
          Add Department
        </Button>
      </div>

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
                  <th>Description</th>
                  <th>Manager</th>
                  <th>Employees</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.id}</td>
                    <td>{dept.name}</td>
                    <td>{dept.description}</td>
                    <td>
                      {dept.managerName ? (
                        <Badge bg="info">{dept.managerName}</Badge>
                      ) : (
                        <Badge bg="secondary">Not Assigned</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg="success">{dept.employeeCount}</Badge>
                    </td>
                    <td>{new Date(dept.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenModal(dept)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: editingDepartment?.name || '',
            description: editingDepartment?.description || '',
            managerId: editingDepartment?.managerId || ''
          }}
          validationSchema={DepartmentSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
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
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                    <option value="">Select Manager</option>
                    {managers.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.role}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default DepartmentList;
