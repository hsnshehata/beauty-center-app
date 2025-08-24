// client/src/pages/UsersPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/Users.css';

function UsersPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin',
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
      toast.success('تم تحميل صفحة إضافة المستخدم بنجاح', { toastId: 'users-page-load' });
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
      await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء المستخدم بنجاح');
      toast.success('تم إنشاء المستخدم بنجاح', { toastId: 'users-create' });
      setFormData({ username: '', password: '', role: 'admin' });
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء المستخدم';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'users-create-error' });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>إضافة مسؤول</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="أدخل اسم المستخدم"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الدور</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">أدمن</option>
                <option value="supervisor">مشرف</option>
                <option value="worker">عامل</option>
              </Form.Select>
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

export default UsersPage;