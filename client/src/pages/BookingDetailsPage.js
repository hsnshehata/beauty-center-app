// client/src/pages/BookingDetailsPage.js
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingRes, installmentsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/bookings/${id}/receipt`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/installments/booking/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBooking(bookingRes.data);
        setInstallments(installmentsRes.data);
        if (!hasFetched.current) {
          toast.success('تم جلب تفاصيل الحجز بنجاح', { toastId: `booking-details-${id}` });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب تفاصيل الحجز';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: `booking-details-error-${id}` });
          hasFetched.current = true;
        }
        console.error('خطأ في جلب التفاصيل:', err.response?.data);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (!booking) {
    return (
      <Container fluid>
        <Row>
          <Col md={3}>
            <Sidebar />
          </Col>
          <Col md={9} className="p-4">
            <h2>تفاصيل الحجز</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <p>جاري تحميل البيانات...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>تفاصيل الحجز</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Card>
            <Card.Body>
              <Card.Title>{booking.clientName}</Card.Title>
              <Card.Text>
                <strong>رقم الهاتف:</strong> {booking.clientPhone}<br />
                <strong>المدينة:</strong> {booking.city}<br />
                <strong>تاريخ الحدث:</strong> {booking.eventDate}<br />
                <strong>الباكدج:</strong> {booking.package ? `${booking.package.name} (${booking.package.price} جنيه)` : 'غير محدد'}<br />
                <strong>باكدج الحنة:</strong> {booking.hennaPackage ? `${booking.hennaPackage.name} (${booking.hennaPackage.price} جنيه)` : 'غير محدد'}<br />
                <strong>تاريخ الحنة:</strong> {booking.hennaPackage?.date || 'غير محدد'}<br />
                <strong>باكدج التصوير:</strong> {booking.photoPackage ? `${booking.photoPackage.name} (${booking.photoPackage.price} جنيه)` : 'غير محدد'}<br />
                <strong>المرتجعات:</strong> {booking.returnedServices.length > 0 ? booking.returnedServices.map(rs => `${rs.serviceId?.name} (${rs.price} جنيه)`).join(', ') : 'لا يوجد'}<br />
                <strong>خدمة إضافية:</strong> {booking.additionalService ? `${booking.additionalService.serviceId?.name} (${booking.additionalService.price} جنيه)` : 'لا يوجد'}<br />
                <strong>فرد الشعر:</strong> {booking.hairStraightening ? `نعم (${booking.hairStraighteningPrice} جنيه)` : 'لا'}<br />
                <strong>تاريخ فرد الشعر:</strong> {booking.hairStraighteningDate || 'غير محدد'}<br />
                <strong>العربون:</strong> {booking.deposit} جنيه<br />
                <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                <strong>المدفوع:</strong> {booking.totalPaid} جنيه<br />
                <strong>الباقي:</strong> {booking.remainingBalance} جنيه
              </Card.Text>
              <h5>الأقساط:</h5>
              {installments.length > 0 ? (
                <ListGroup>
                  {installments.map((inst, index) => (
                    <ListGroup.Item key={index}>
                      {inst.amount} جنيه - {new Date(inst.createdAt).toLocaleDateString('ar-EG')}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>لا توجد أقساط</p>
              )}
              <Button variant="primary" onClick={() => window.open(`/receipt/${id}`, '_blank')} className="mt-3 me-2">
                طباعة
              </Button>
              <Button variant="warning" onClick={() => navigate(`/edit-booking/${id}`)} className="mt-3 me-2">
                تعديل
              </Button>
              <Button variant="secondary" onClick={() => navigate('/bookings')} className="mt-3">
                رجوع
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingDetailsPage;