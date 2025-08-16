// client/src/pages/ServicePage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/Service.css';

function ServicePage() {
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    employeeId: '',
    price: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [servicesRes, employeesRes, executionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/services', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/employees', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/services/execute', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setServices(servicesRes.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)` })));
        setEmployees(employeesRes.data.map(e => ({ value: e._id, label: e.name })));
        setExecutions(executionsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب البيانات');
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
      ...(name === 'serviceId' && selectedOption
        ? { price: services.find(s => s.value === selectedOption.value)?.label.match(/\d+/)?.[0] || 0 }
        : {}),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/services/execute', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تسجيل الخدمة المنفذة بنجاح');
      setFormData({ serviceId: '', employeeId: '', price: 0 });
      setShowModal(false);
      const response = await axios.get('http://localhost:5000/api/services/execute', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExecutions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الخدمة');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>خدمات فورية</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
            تسجيل خدمة منفذة
          </Button>
          <Row>
            {executions.map(execution => (
              <Col md={4} key={execution._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{execution.serviceId.name}</Card.Title>
                    <Card.Text>
                      الموظف: {execution.employeeId.name}<br />
                      السعر: {execution.price} جنيه<br />
                      التاريخ: {new Date(execution.createdAt).toLocaleDateString('ar-EG')}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تسجيل خدمة منفذة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>الخدمة</Form.Label>
                  <Select
                    options={services}
                    onChange={(option) => handleSelectChange('serviceId', option)}
                    placeholder="اختر الخدمة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الموظف</Form.Label>
                  <Select
                    options={employees}
                    onChange={(option) => handleSelectChange('employeeId', option)}
                    placeholder="اختر الموظف"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="أدخل السعر"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)} className="ms-2">
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default ServicePage;