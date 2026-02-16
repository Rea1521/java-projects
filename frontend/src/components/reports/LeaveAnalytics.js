import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { getAllLeaves } from '../../services/leaveService';
import { getAllEmployees } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const LeaveAnalytics = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesData, employeesData, departmentsData] = await Promise.all([
        getAllLeaves(),
        getAllEmployees(),
        getAllDepartments()
      ]);
      setLeaves(leavesData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTimeRange = (data) => {
    const now = moment();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = now.clone().subtract(1, 'week');
        break;
      case 'month':
        startDate = now.clone().subtract(1, 'month');
        break;
      case 'quarter':
        startDate = now.clone().subtract(3, 'months');
        break;
      case 'year':
        startDate = now.clone().subtract(1, 'year');
        break;
      default:
        return data;
    }

    return data.filter(item => moment(item.createdAt).isAfter(startDate));
  };

  const filterDataByDepartment = (data) => {
    if (selectedDepartment === 'all') return data;
    return data.filter(item => {
      const employee = employees.find(e => e.id === item.employeeId);
      return employee?.departmentId === parseInt(selectedDepartment);
    });
  };

  const filteredLeaves = filterDataByDepartment(filterDataByTimeRange(leaves));

  // Leave Status Distribution
  const statusData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    datasets: [
      {
        data: [
          filteredLeaves.filter(l => l.status === 'PENDING').length,
          filteredLeaves.filter(l => l.status === 'APPROVED').length,
          filteredLeaves.filter(l => l.status === 'REJECTED').length,
          filteredLeaves.filter(l => l.status === 'CANCELLED').length
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Leave Types Distribution
  const leaveTypeData = {
    labels: ['Paid Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'],
    datasets: [
      {
        label: 'Number of Leaves',
        data: [
          filteredLeaves.filter(l => l.leaveType === 'PAID_LEAVE').length,
          filteredLeaves.filter(l => l.leaveType === 'SICK_LEAVE').length,
          filteredLeaves.filter(l => l.leaveType === 'CASUAL_LEAVE').length,
          filteredLeaves.filter(l => l.leaveType === 'UNPAID_LEAVE').length
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Monthly Trend
  const getMonthlyData = () => {
    const months = [];
    const counts = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months');
      months.push(month.format('MMM YYYY'));
      
      const count = filteredLeaves.filter(l => 
        moment(l.createdAt).isSame(month, 'month')
      ).length;
      
      counts.push(count);
    }
    
    return { months, counts };
  };

  const monthlyTrend = getMonthlyData();

  const trendData = {
    labels: monthlyTrend.months,
    datasets: [
      {
        label: 'Leave Applications',
        data: monthlyTrend.counts,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Department-wise Summary
  const getDepartmentSummary = () => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(e => e.departmentId === dept.id);
      const deptLeaves = filteredLeaves.filter(l => 
        deptEmployees.some(e => e.id === l.employeeId)
      );
      
      return {
        department: dept.name,
        totalLeaves: deptLeaves.length,
        approved: deptLeaves.filter(l => l.status === 'APPROVED').length,
        pending: deptLeaves.filter(l => l.status === 'PENDING').length,
        rejected: deptLeaves.filter(l => l.status === 'REJECTED').length,
        totalDays: deptLeaves.reduce((sum, l) => sum + l.numberOfDays, 0)
      };
    });
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
    <Container fluid>
      <h2 className="mb-4">Leave Analytics & Reports</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Time Range</Form.Label>
            <Form.Select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3>{filteredLeaves.length}</h3>
              <p className="text-muted mb-0">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3>
                {filteredLeaves.reduce((sum, l) => sum + l.numberOfDays, 0)}
              </h3>
              <p className="text-muted mb-0">Total Days</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3>
                {(filteredLeaves.reduce((sum, l) => sum + l.numberOfDays, 0) / filteredLeaves.length || 0).toFixed(1)}
              </h3>
              <p className="text-muted mb-0">Average Days per Leave</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Pie data={statusData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Leave Types</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={leaveTypeData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      stepSize: 1
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Monthly Trend</h5>
            </Card.Header>
            <Card.Body>
              <Line data={trendData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Department-wise Summary</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Leaves</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Rejected</th>
                    <th>Total Days</th>
                    <th>Avg Days/Leave</th>
                  </tr>
                </thead>
                <tbody>
                  {getDepartmentSummary().map(dept => (
                    <tr key={dept.department}>
                      <td>{dept.department}</td>
                      <td>{dept.totalLeaves}</td>
                      <td className="text-success">{dept.approved}</td>
                      <td className="text-warning">{dept.pending}</td>
                      <td className="text-danger">{dept.rejected}</td>
                      <td>{dept.totalDays}</td>
                      <td>{(dept.totalDays / dept.totalLeaves || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LeaveAnalytics;
