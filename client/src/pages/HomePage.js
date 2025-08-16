// client/src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';

function HomePage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
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
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب الحجوزات');
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
    const makeup = bookings.filter(b => b.packageId.type === 'makeup');
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
                      الهاتف: {booking.clientPhone}<br />
                      المدينة: {booking.city}<br />
                      التاريخ: {new Date(booking.eventDate).toLocaleDateString('ar-EG')}<br />
                      الإجمالي: {booking.totalPrice} جنيه
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
                      الهاتف: {booking.clientPhone}<br />
                      المدينة: {booking.city}<br />
                      تاريخ الفرد: {booking.hairStraighteningDate ? new Date(booking.hairStraighteningDate).toLocaleDateString('ar-EG') : '-'}<br />
                      الإجمالي: {booking.totalPrice} جنيه
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
                      الهاتف: {booking.clientPhone}<br />
                      المدينة: {booking.city}<br />
                      التاريخ: {new Date(booking.eventDate).toLocaleDateString('ar-EG')}<br />
                      الإجمالي: {booking.totalPrice} جنيه
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