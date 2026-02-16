import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaDownload, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: null,
    endDate: null,
    userId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/audit');
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.entityType) {
      filtered = filtered.filter(log => log.entityType === filters.entityType);
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.user?.id === parseInt(filters.userId));
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => moment(log.timestamp).isAfter(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => moment(log.timestamp).isBefore(filters.endDate));
    }

    setFilteredLogs(filtered);
  };

  const resetFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      startDate: null,
      endDate: null,
      userId: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const csvData = filteredLogs.map(log => [
      moment(log.timestamp).format('DD/MM/YYYY HH:mm:ss'),
      log.user?.username || 'System',
      log.action,
      log.entityType,
      log.entityId || '-',
      log.ipAddress || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const getActionBadge = (action) => {
    const variants = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'danger',
      APPROVE: 'success',
      REJECT: 'danger',
      LOGIN: 'primary',
      LOGOUT: 'secondary'
    };
    
    const actionType = action.split('_')[0];
    return <Badge bg={variants[actionType] || 'primary'}>{action}</Badge>;
  };

  const entityTypes = [...new Set(logs.map(log => log.entityType))];
  const actions = [...new Set(logs.map(log => log.action))];

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Audit Logs</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button variant="success" onClick={exportToCSV}>
            <FaDownload className="me-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Entity Type</Form.Label>
                  <Form.Select
                    value={filters.entityType}
                    onChange={(e) => setFilters({...filters, entityType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    {entityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Action</Form.Label>
                  <Form.Select
                    value={filters.action}
                    onChange={(e) => setFilters({...filters, action: e.target.value})}
                  >
                    <option value="">All Actions</option>
                    {actions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => setFilters({...filters, startDate: date})}
                    className="form-control"
                    placeholderText="Select start date"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => setFilters({...filters, endDate: date})}
                    className="form-control"
                    placeholderText="Select end date"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                    minDate={filters.startDate}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Changes</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{moment(log.timestamp).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>{log.user?.username || 'System'}</td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>{log.entityType}</td>
                    <td>{log.entityId || '-'}</td>
                    <td>
                      {log.oldValue && log.newValue ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            alert(`Old: ${log.oldValue}\n\nNew: ${log.newValue}`);
                          }}
                        >
                          View Changes
                        </Button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{log.ipAddress || '-'}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No audit logs found
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

export default AuditLogs;
