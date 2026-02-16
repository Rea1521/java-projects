import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Badge, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../services/holidayService';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

const HolidaySchema = Yup.object().shape({
  name: Yup.string().required('Holiday name is required'),
  date: Yup.date().required('Date is required'),
  description: Yup.string(),
  recurring: Yup.boolean()
});

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const data = await getAllHolidays();
      // Sort by date
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sorted);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (holiday = null) => {
    setEditingHoliday(holiday);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHoliday(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, values);
        toast.success('Holiday updated successfully');
      } else {
        await createHoliday(values);
        toast.success('Holiday created successfully');
      }
      fetchHolidays();
      handleCloseModal();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await deleteHoliday(id);
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  const groupHolidaysByMonth = () => {
    const grouped = {};
    holidays.forEach(holiday => {
      const month = moment(holiday.date).format('MMMM YYYY');
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(holiday);
    });
    return grouped;
  };

  const groupedHolidays = groupHolidaysByMonth();

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Holiday Calendar</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" />
          Add Holiday
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
            <Card key={month} className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2 text-primary" />
                  {month}
                </h5>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Holiday Name</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthHolidays.map(holiday => (
                      <tr key={holiday.id}>
                        <td>{moment(holiday.date).format('DD/MM/YYYY')}</td>
                        <td>{moment(holiday.date).format('dddd')}</td>
                        <td><strong>{holiday.name}</strong></td>
                        <td>{holiday.description || '-'}</td>
                        <td>
                          {holiday.recurring ? (
                            <Badge bg="success">Recurring Yearly</Badge>
                          ) : (
                            <Badge bg="info">One Time</Badge>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleOpenModal(holiday)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDelete(holiday.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          {holidays.length === 0 && (
            <Card>
              <Card.Body className="text-center py-5">
                <FaCalendarAlt size={50} className="text-muted mb-3" />
                <h5>No holidays added yet</h5>
                <p className="text-muted">Click the "Add Holiday" button to add your first holiday.</p>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: editingHoliday?.name || '',
            date: editingHoliday?.date ? moment(editingHoliday.date).format('YYYY-MM-DD') : '',
            description: editingHoliday?.description || '',
            recurring: editingHoliday?.recurring || false
          }}
          validationSchema={HolidaySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Holiday Name *</Form.Label>
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
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.date && errors.date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.date}
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
                  <Form.Check
                    type="checkbox"
                    label="Recurring (This holiday repeats every year)"
                    name="recurring"
                    checked={values.recurring}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingHoliday ? 'Update' : 'Create')}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default HolidayList;
