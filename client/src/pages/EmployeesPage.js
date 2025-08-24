// client/src/pages/EmployeesPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/Employees.css';

function EmployeesPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    salary: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!hasFetched.current) {
      toast.success('تم تحميل صفحة إضافة الموظف بنجاح', { toastId: 'employees-page-load' });
      hasFetched.current = true;
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/employees', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الموظف بنجاح');
      toast.success('تم إنشاء الموظف بنجاح', { toastId: 'employees-create' });
      setFormData({ name: '', phone: '', salary: '' });
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء الموظف';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'employees-create-error' });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>إضافة موظف</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>اسم الموظف</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم الموظف"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>رقم الهاتف</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهاتف"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>المرتب</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="أدخل المرتب"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              حفظ
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeesPage;