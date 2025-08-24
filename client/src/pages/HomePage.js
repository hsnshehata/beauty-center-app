// client/src/pages/HomePage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

function HomePage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const hasFetched = useRef(false); // لمنع تكرار الإشعارات
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings/today', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب حجوزات اليوم بنجاح');
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب الحجوزات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage);
          hasFetched.current = true;
        }
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleAction = (id, action) => {
    if (action === 'print') {
      window.open(`/receipt/${id}`, '_blank');
    } else if (action === 'edit') {
      navigate(`/edit-booking/${id}`);
    } else if (action === 'details') {
      navigate(`/booking/${id}`);
    } else if (action === 'add-installment') {
      navigate(`/installment/${id}`);
    }
  };

  const groupBookings = () => {
    const makeup = bookings.filter(b => b.packageId?.type === 'makeup');
    const hair = bookings.filter(b => b.hairStraightening);
    const photo = bookings.filter(b => b.photoPackageId);
    return { makeup, hair, photo };
  };

  const { makeup, hair, photo } = groupBookings();

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>حجوزات اليوم</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <h4>حجوزات الميك اب</h4>
          <Row>
            {makeup.map(booking => (
              <Col md={4} key={booking._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{booking.clientName}</Card.Title>
                    <Card.Text>
                      <strong>الخدمة:</strong> ميك اب - {booking.packageId?.name}<br />
                      <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                      <strong>المدفوع:</strong> {booking.totalPaid} جنيه<br />
                      <strong>الباقي:</strong> {booking.remainingBalance} جنيه
                    </Card.Text>
                    <Button variant="primary" onClick={() => handleAction(booking._id, 'print')} className="me-2">طباعة</Button>
                    <Button variant="warning" onClick={() => handleAction(booking._id, 'edit')} className="me-2">تعديل</Button>
                    <Button variant="info" onClick={() => handleAction(booking._id, 'details')} className="me-2">تفاصيل</Button>
                    <Button variant="success" onClick={() => handleAction(booking._id, 'add-installment')}>إضافة قسط</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>حجوزات فرد الشعر</h4>
          <Row>
            {hair.map(booking => (
              <Col md={4} key={booking._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{booking.clientName}</Card.Title>
                    <Card.Text>
                      <strong>الخدمة:</strong> فرد الشعر<br />
                      <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                      <strong>المدفوع:</strong> {booking.totalPaid} جنيه<br />
                      <strong>الباقي:</strong> {booking.remainingBalance} جنيه
                    </Card.Text>
                    <Button variant="primary" onClick={() => handleAction(booking._id, 'print')} className="me-2">طباعة</Button>
                    <Button variant="warning" onClick={() => handleAction(booking._id, 'edit')} className="me-2">تعديل</Button>
                    <Button variant="info" onClick={() => handleAction(booking._id, 'details')} className="me-2">تفاصيل</Button>
                    <Button variant="success" onClick={() => handleAction(booking._id, 'add-installment')}>إضافة قسط</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>حجوزات التصوير</h4>
          <Row>
            {photo.map(booking => (
              <Col md={4} key={booking._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{booking.clientName}</Card.Title>
                    <Card.Text>
                      <strong>الخدمة:</strong> تصوير - {booking.photoPackageId?.name}<br />
                      <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                      <strong>المدفوع:</strong> {booking.totalPaid} جنيه<br />
                      <strong>الباقي:</strong> {booking.remainingBalance} جنيه
                    </Card.Text>
                    <Button variant="primary" onClick={() => handleAction(booking._id, 'print')} className="me-2">طباعة</Button>
                    <Button variant="warning" onClick={() => handleAction(booking._id, 'edit')} className="me-2">تعديل</Button>
                    <Button variant="info" onClick={() => handleAction(booking._id, 'details')} className="me-2">تفاصيل</Button>
                    <Button variant="success" onClick={() => handleAction(booking._id, 'add-installment')}>إضافة قسط</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;