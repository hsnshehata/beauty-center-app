// client/src/pages/InstallmentPage.js
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

function InstallmentPage() {
  const { id } = useParams();
  const [amount, setAmount] = useState('');
  const [booking, setBooking] = useState(null);
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

    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${id}/receipt`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب تفاصيل الحجز بنجاح', { toastId: `installment-fetch-${id}` });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب تفاصيل الحجز';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: `installment-fetch-error-${id}` });
          hasFetched.current = true;
        }
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/installments', {
        bookingId: id,
        amount: parseFloat(amount),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إضافة القسط بنجاح');
      toast.success('تم إضافة القسط بنجاح', { toastId: `installment-create-${id}` });
      setAmount('');
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إضافة القسط';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `installment-create-error-${id}` });
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
          {booking && (
            <div className="mb-3">
              <p><strong>اسم العميل:</strong> {booking.clientName}</p>
              <p><strong>الإجمالي:</strong> {booking.totalPrice} جنيه</p>
              <p><strong>المدفوع:</strong> {booking.totalPaid} جنيه</p>
              <p><strong>الباقي:</strong> {booking.remainingBalance} جنيه</p>
            </div>
          )}
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