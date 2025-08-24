// client/src/pages/DailyReportsPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/DailyReports.css';

function DailyReportsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/daily', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب التقرير اليومي بنجاح', { toastId: 'daily-report-fetch' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب التقرير';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'daily-report-error' });
          hasFetched.current = true;
        }
      }
    };

    fetchReport();
  }, [navigate]);

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (!report) {
    return <div className="text-center m-3">جاري التحميل...</div>;
  }

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>التقارير اليومية</h2>
          {report.summary && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>الملخص</Card.Title>
                <Card.Text>
                  <strong>إجمالي الحجوزات:</strong> {report.summary.totalBookings} جنيه<br />
                  <strong>إجمالي الخدمات:</strong> {report.summary.totalServices} جنيه<br />
                  <strong>إجمالي المصروفات:</strong> {report.summary.totalExpenses} جنيه<br />
                  <strong>إجمالي السلف:</strong> {report.summary.totalAdvances} جنيه<br />
                  <strong>الصافي:</strong> {report.summary.net} جنيه
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          <h4>الحجوزات</h4>
          <Row>
            {report.bookings.map(booking => (
              <Col md={4} key={booking._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{booking.clientName}</Card.Title>
                    <Card.Text>
                      الهاتف: {booking.clientPhone}<br />
                      الإجمالي: {booking.totalPrice} جنيه
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>الخدمات المنفذة</h4>
          <Row>
            {report.services.map(service => (
              <Col md={4} key={service._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{service.serviceId.name}</Card.Title>
                    <Card.Text>
                      الموظف: {service.employeeId.name}<br />
                      السعر: {service.price} جنيه
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>المصروفات</h4>
          <Row>
            {report.expenses.map(expense => (
              <Col md={4} key={expense._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{expense.details}</Card.Title>
                    <Card.Text>
                      المبلغ: {expense.amount} جنيه<br />
                      بواسطة: {expense.createdBy.username}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>السلف</h4>
          <Row>
            {report.advances.map(advance => (
              <Col md={4} key={advance._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{advance.employeeId.name}</Card.Title>
                    <Card.Text>
                      المبلغ: {advance.amount} جنيه<br />
                      بواسطة: {advance.createdBy.username}
                    </Card.Text>
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

export default DailyReportsPage;