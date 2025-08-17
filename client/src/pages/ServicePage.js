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
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', price: '' });
  const [executeForm, setExecuteForm] = useState({ serviceId: '', employeeId: '', price: 0 });
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

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm({ ...serviceForm, [name]: value });
  };

  const handleExecuteInputChange = (e) => {
    const { name, value } = e.target;
    setExecuteForm({ ...executeForm, [name]: value });
  };

  const handleExecuteSelectChange = (name, selectedOption) => {
    setExecuteForm({
      ...executeForm,
      [name]: selectedOption ? selectedOption.value : '',
      ...(name === 'serviceId' && selectedOption
        ? { price: services.find(s => s.value === selectedOption.value)?.label.match(/\d+/)?.[0] || 0 }
        : {}),
    });
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/services', serviceForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الخدمة بنجاح');
      setServiceForm({ name: '', price: '' });
      setShowAddServiceModal(false);
      const response = await axios.get('http://localhost:5000/api/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)` })));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء الخدمة');
    }
  };

  const handleExecuteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/services/execute', executeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تسجيل الخدمة المنفذة بنجاح');
      setExecuteForm({ serviceId: '', employeeId: '', price: 0 });
      setShowExecuteModal(false);
      const response = await axios.get('http://localhost:5000/api/services/execute', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExecutions(response.data);
      setTimeout(() => setSuccess(''), 2000);
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
          <Button variant="primary" onClick={() => setShowAddServiceModal(true)} className="mb-3 me-2">
            إضافة خدمة جديدة
          </Button>
          <Button variant="primary" onClick={() => setShowExecuteModal(true)} className="mb-3">
            تسجيل خدمة منفذة
          </Button>
          <h4>الخدمات المنفذة</h4>
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
          <Modal show={showAddServiceModal} onHide={() => setShowAddServiceModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>إضافة خدمة فورية</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddServiceSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={serviceForm.name}
                    onChange={handleServiceInputChange}
                    placeholder="أدخل اسم الخدمة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={serviceForm.price}
                    onChange={handleServiceInputChange}
                    placeholder="أدخل السعر"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowAddServiceModal(false)} className="ms-2">
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={showExecuteModal} onHide={() => setShowExecuteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تسجيل خدمة منفذة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleExecuteSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>الخدمة</Form.Label>
                  <Select
                    options={services}
                    onChange={(option) => handleExecuteSelectChange('serviceId', option)}
                    placeholder="اختر الخدمة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الموظف</Form.Label>
                  <Select
                    options={employees}
                    onChange={(option) => handleExecuteSelectChange('employeeId', option)}
                    placeholder="اختر الموظف"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={executeForm.price}
                    onChange={handleExecuteInputChange}
                    placeholder="أدخل السعر"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowExecuteModal(false)} className="ms-2">
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