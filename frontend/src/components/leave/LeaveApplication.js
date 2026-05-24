import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { applyForLeave, getLeaveBalance } from '../../services/leaveService';
import { getEmployeeByUserId } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import moment from 'moment';

const LeaveSchema = Yup.object().shape({
  leaveType: Yup.string().required('Leave type is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date cannot be before start date'),
  reason: Yup.string()
    .required('Reason is required')
    .min(10, 'Reason must be at least 10 characters'),
});

const LeaveApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    resolveEmployeeAndFetchBalances();
  }, []);

  const resolveEmployeeAndFetchBalances = async () => {
    try {
      const employee = await getEmployeeByUserId(user.id);
      setEmployeeId(employee.id);
      const [paid, sick, casual] = await Promise.all([
        getLeaveBalance(employee.id, 'PAID_LEAVE'),
        getLeaveBalance(employee.id, 'SICK_LEAVE'),
        getLeaveBalance(employee.id, 'CASUAL_LEAVE')
      ]);
      setBalances({
        PAID_LEAVE: paid,
        SICK_LEAVE: sick,
        CASUAL_LEAVE: casual
      });
    } catch (error) {
      toast.error('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days') + 1;
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const days = calculateDays(values.startDate, values.endDate);
      
      // Check if enough balance
      if (values.leaveType !== 'UNPAID_LEAVE') {
        const balance = balances[values.leaveType];
        if (days > balance) {
          toast.error(`Insufficient balance. Available: ${balance} days`);
          return;
        }
      }

      const leaveData = {
        ...values,
        numberOfDays: days
      };

      await applyForLeave(leaveData);
      toast.success('Leave application submitted successfully!');
      resetForm();
      navigate('/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              Apply for Leave
            </Card.Header>
            <Card.Body>
              {!loading && (
                <Row className="mb-4">
                  <Col md={4}>
                    <Alert variant="info">
                      <strong>Paid Leave</strong>
                      <br />
                      Balance: {balances.PAID_LEAVE} days
                    </Alert>
                  </Col>
                  <Col md={4}>
                    <Alert variant="warning">
                      <strong>Sick Leave</strong>
                      <br />
                      Balance: {balances.SICK_LEAVE} days
                    </Alert>
                  </Col>
                  <Col md={4}>
                    <Alert variant="success">
                      <strong>Casual Leave</strong>
                      <br />
                      Balance: {balances.CASUAL_LEAVE} days
                    </Alert>
                  </Col>
                </Row>
              )}

              <Formik
                initialValues={{
                  leaveType: '',
                  startDate: null,
                  endDate: null,
                  reason: ''
                }}
                validationSchema={LeaveSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Leave Type *</Form.Label>
                      <Field
                        as="select"
                        name="leaveType"
                        className={`form-control ${touched.leaveType && errors.leaveType ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select leave type</option>
                        <option value="PAID_LEAVE">Paid Leave</option>
                        <option value="SICK_LEAVE">Sick Leave</option>
                        <option value="CASUAL_LEAVE">Casual Leave</option>
                        <option value="UNPAID_LEAVE">Unpaid Leave</option>
                      </Field>
                      <ErrorMessage name="leaveType" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date *</Form.Label>
                          <DatePicker
                            selected={values.startDate}
                            onChange={(date) => setFieldValue('startDate', date)}
                            minDate={new Date()}
                            className={`form-control ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`}
                            placeholderText="Select start date"
                            dateFormat="yyyy-MM-dd"
                          />
                          <ErrorMessage name="startDate" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date *</Form.Label>
                          <DatePicker
                            selected={values.endDate}
                            onChange={(date) => setFieldValue('endDate', date)}
                            minDate={values.startDate || new Date()}
                            className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
                            placeholderText="Select end date"
                            dateFormat="yyyy-MM-dd"
                          />
                          <ErrorMessage name="endDate" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                    </Row>

                    {values.startDate && values.endDate && (
                      <Alert variant="secondary">
                        Total Days: {calculateDays(values.startDate, values.endDate)}
                      </Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>Reason *</Form.Label>
                      <Field
                        as="textarea"
                        name="reason"
                        rows="4"
                        className={`form-control ${touched.reason && errors.reason ? 'is-invalid' : ''}`}
                        placeholder="Please provide a detailed reason for your leave"
                      />
                      <ErrorMessage name="reason" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/dashboard')}
                      >
                        Cancel
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

export default LeaveApplication;
