// client/src/pages/WorkerDashboard.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { QrReader } from 'react-qr-reader';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

function WorkerDashboard() {
  const [manualId, setManualId] = useState('');
  const [services, setServices] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const [userRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/worker-points', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPoints(userRes.data.points);
        setPointsHistory(historyRes.data);
        if (!hasFetched.current) {
          toast.success('تم تحميل بيانات الموظف بنجاح', { toastId: 'worker-dashboard-load' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب البيانات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'worker-dashboard-error' });
          hasFetched.current = true;
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleScan = async (data) => {
    if (data) {
      await fetchServices(data);
    }
  };

  const handleError = (err) => {
    setError('خطأ في مسح الباركود');
    toast.error('خطأ في مسح الباركود', { toastId: 'worker-scan-error' });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualId) {
      await fetchServices(manualId);
    }
  };

  const fetchServices = async (id) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      try {
        response = await axios.get(`http://localhost:5000/api/bookings/${id}/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        response = await axios.get(`http://localhost:5000/api/services/execute/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setServices(response.data);
      toast.success('تم جلب الخدمات بنجاح', { toastId: `worker-services-${id}` });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'رقم الوصل غير صحيح';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `worker-services-error-${id}` });
    }
  };

  const handleExecuteService = async (service) => {
    try {
      const token = localStorage.getItem('token');
      if (service.type === 'serviceExecution') {
        await axios.post(`http://localhost:5000/api/services/execute/${service.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://localhost:5000/api/bookings/${service.bookingId}/execute`, {
          serviceType: service.type,
          serviceIndex: service.index,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success('تم بدء تنفيذ الخدمة', { toastId: `execute-service-${service.id || service.index}` });
      await fetchServices(service.bookingId || service.id);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في تنفيذ الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `execute-service-error-${service.id || service.index}` });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>لوحة تحكم الموظف</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <h4>مسح الباركود</h4>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%', maxWidth: '300px' }}
          />
          <h4 className="mt-3">أو أدخل رقم الوصل يدويًا</h4>
          <Form onSubmit={handleManualSubmit} className="mb-3">
            <Form.Group>
              <Form.Control
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="أدخل رقم الوصل"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              جلب الخدمات
            </Button>
          </Form>
          <h4>الخدمات</h4>
          <Row>
            {services.map((service, index) => (
              <Col md={4} key={index} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{service.name}</Card.Title>
                    <Card.Text>
                      السعر: {service.price} جنيه<br />
                      الحالة: {service.status === 'pending' ? 'في الانتظار' : service.status === 'in_progress' ? 'قيد التنفيذ' : 'نُفذت'}<br />
                      بواسطة: {service.executedBy?.username || 'غير محدد'}
                    </Card.Text>
                    {service.status === 'pending' && (
                      <Button
                        variant="success"
                        onClick={() => handleExecuteService(service)}
                      >
                        تنفيذ الخدمة
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <h4>النقاط الحالية: {points}</h4>
          <h4>سجل النقاط</h4>
          <Row>
            {pointsHistory.map((history, index) => (
              <Col md={4} key={index} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{history.month}/{history.year}</Card.Title>
                    <Card.Text>
                      النقاط: {history.points}<br />
                      الخدمات: {history.services.length}
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

export default WorkerDashboard;