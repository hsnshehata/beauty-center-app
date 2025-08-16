// client/src/pages/PackagesPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import '../css/Packages.css';

function PackagesPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'makeup',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
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
      await axios.post('http://localhost:5000/api/packages', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الباكدج بنجاح');
      setFormData({ name: '', price: '', type: 'makeup' });
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء الباكدج');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>إضافة خدمات/باكدجات</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>اسم الباكدج</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم الباكدج"
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
            <Form.Group className="mb-3">
              <Form.Label>النوع</Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="makeup">ميك اب</option>
                <option value="photo">تصوير</option>
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

export default PackagesPage;