import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { getHolidayById, createHoliday, updateHoliday } from '../../services/holidayService';
import { toast } from 'react-toastify';
import moment from 'moment';

const HolidaySchema = Yup.object().shape({
  name: Yup.string().required('Holiday name is required'),
  date: Yup.date().required('Date is required'),
  description: Yup.string(),
  recurring: Yup.boolean()
});

const HolidayForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    date: '',
    description: '',
    recurring: false
  });

  useEffect(() => {
    if (id) {
      fetchHoliday();
    }
  }, [id]);

  const fetchHoliday = async () => {
    try {
      setLoading(true);
      const data = await getHolidayById(id);
      setInitialValues({
        name: data.name || '',
        date: data.date ? moment(data.date).format('YYYY-MM-DD') : '',
        description: data.description || '',
        recurring: data.recurring || false
      });
    } catch (error) {
      toast.error('Failed to fetch holiday details');
      navigate('/holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (id) {
        await updateHoliday(id, values);
        toast.success('Holiday updated successfully');
      } else {
        await createHoliday(values);
        toast.success('Holiday created successfully');
      }
      navigate('/holidays');
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
              {id ? 'Edit Holiday' : 'Add New Holiday'}
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={HolidaySchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Holiday Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                        placeholder="e.g., Christmas, New Year, Independence Day"
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
                      <Form.Text className="text-muted">
                        Select the date of the holiday
                      </Form.Text>
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
                        placeholder="Enter holiday description (optional)"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Recurring Yearly"
                        name="recurring"
                        checked={values.recurring}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Check this if the holiday occurs on the same date every year
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/holidays')}
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

export default HolidayForm;
