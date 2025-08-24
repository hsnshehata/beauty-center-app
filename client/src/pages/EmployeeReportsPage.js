// client/src/pages/EmployeeReportsPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/EmployeeReports.css';

function EmployeeReportsPage() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const hasFetchedEmployees = useRef(false);
  const hasFetchedReport = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data.map(e => ({ value: e._id, label: e.name })));
        if (!hasFetchedEmployees.current) {
          toast.success('تم جلب الموظفين بنجاح', { toastId: 'employee-report-fetch-employees' });
          hasFetchedEmployees.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب الموظفين';
        setError(errorMessage);
        if (!hasFetchedEmployees.current) {
          toast.error(errorMessage, { toastId: 'employee-report-error-employees' });
          hasFetchedEmployees.current = true;
        }
      }
    };

    fetchEmployees();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, employeeId: selectedOption ? selectedOption.value : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { startDate, endDate, employeeId } = formData;
      const response = await axios.get(`http://localhost:5000/api/reports/employees?startDate=${startDate}&endDate=${endDate}&employeeId=${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(response.data);
      toast.success('تم جلب التقرير بنجاح', { toastId: 'employee-report-fetch-report' });
      hasFetchedReport.current = true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في جلب التقرير';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'employee-report-error-report' });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>تقارير الموظفين</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} className="mb-3">
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>من تاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>إلى تاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>الموظف</Form.Label>
                  <Select
                    options={employees}
                    onChange={handleSelectChange}
                    placeholder="اختر الموظف"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" className="mt-3">
              عرض التقرير
            </Button>
          </Form>
          {report && (
            <Card>
              <Card.Body>
                <Card.Title>تقرير الموظف</Card.Title>
                <Card.Text>
                  <strong>عدد الخدمات:</strong> {report.totalServices}<br />
                  <strong>إجمالي الخدمات:</strong> {report.totalServicePrice} جنيه<br />
                  <strong>إجمالي السلف:</strong> {report.totalAdvances} جنيه<br />
                  <strong>أكثر الخدمات:</strong><br />
                  {report.topServices.map((service, index) => (
                    <span key={index}>{service.name}: {service.count} مرة<br /></span>
                  ))}
                </Card.Text>
                <h5>الخدمات المنفذة</h5>
                <Row>
                  {report.serviceExecutions.map(execution => (
                    <Col md={4} key={execution._id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <Card.Text>
                            الخدمة: {execution.serviceId.name}<br />
                            السعر: {execution.price} جنيه<br />
                            التاريخ: {new Date(execution.createdAt).toLocaleDateString('ar-EG')}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <h5>السلف</h5>
                <Row>
                  {report.advances.map(advance => (
                    <Col md={4} key={advance._id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <Card.Text>
                            المبلغ: {advance.amount} جنيه<br />
                            التاريخ: {new Date(advance.createdAt).toLocaleDateString('ar-EG')}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeReportsPage;