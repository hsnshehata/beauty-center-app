// client/src/pages/InstallmentPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import '../css/Installment.css';

function InstallmentPage() {
  const { id } = useParams();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/installments', {
        bookingId: id,
        amount,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إضافة القسط بنجاح');
      setAmount('');
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إضافة القسط');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>إضافة قسط</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>مبلغ القسط</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل مبلغ القسط"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              حفظ
            </Button>
            <Button variant="secondary" onClick={() => navigate('/bookings')} className="ms-2">
              إلغاء
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default InstallmentPage;