// client/src/pages/BookingDetailsPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import '../css/BookingDetails.css';

function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
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
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب تفاصيل الحجز');
      }
    };

    fetchBooking();
  }, [id, navigate]);

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (!booking) {
    return <div className="text-center m-3">جاري التحميل...</div>;
  }

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>تفاصيل الحجز</h2>
          <Card>
            <Card.Body>
              <Card.Title>{booking.clientName}</Card.Title>
              <Card.Text>
                <strong>رقم الهاتف:</strong> {booking.clientPhone}<br />
                <strong>المدينة:</strong> {booking.city}<br />
                <strong>تاريخ الحدث:</strong> {booking.eventDate}<br />
                <strong>الباكدج الرئيسي:</strong> {booking.package.name} - {booking.package.price} جنيه<br />
                {booking.hennaPackage && (
                  <>
                    <strong>باكدج الحنة:</strong> {booking.hennaPackage.name} - {booking.hennaPackage.price} جنيه (تاريخ: {booking.hennaPackage.date})<br />
                  </>
                )}
                {booking.photoPackage && (
                  <>
                    <strong>باكدج التصوير:</strong> {booking.photoPackage.name} - {booking.photoPackage.price} جنيه<br />
                  </>
                )}
                {booking.returnedServices.length > 0 && (
                  <>
                    <strong>الخدمات المرتجعة:</strong><br />
                    {booking.returnedServices.map((rs, index) => (
                      <span key={index}>{rs.name} - ({rs.price} جنيه)<br /></span>
                    ))}
                  </>
                )}
                {booking.additionalService && (
                  <>
                    <strong>خدمة إضافية:</strong> {booking.additionalService.name} - {booking.additionalService.price} جنيه<br />
                  </>
                )}
                {booking.hairStraightening && (
                  <>
                    <strong>فرد الشعر:</strong> {booking.hairStraightening.price} جنيه (تاريخ: {booking.hairStraightening.date})<br />
                  </>
                )}
                <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                <strong>تم الإنشاء بواسطة:</strong> {booking.createdBy}<br />
                <strong>تاريخ الإنشاء:</strong> {booking.createdAt}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingDetailsPage;