// client/src/pages/BookingPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/Booking.css';

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState({ clientName: '', clientPhone: '', eventDate: '' });
  const [formData, setFormData] = useState({
    packageId: '',
    hennaPackageId: '',
    photoPackageId: '',
    returnedServices: [],
    additionalService: { serviceId: '', price: 0 },
    clientName: '',
    clientPhone: '',
    city: '',
    eventDate: '',
    hennaDate: '',
    hairStraightening: false,
    hairStraighteningPrice: 0,
    hairStraighteningDate: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingsRes, packagesRes, servicesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/bookings?page=${page}&limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/packages', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/packageServices', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setBookings(bookingsRes.data);
        setPackages(packagesRes.data.map(p => ({ value: p._id, label: `${p.name} (${p.price} جنيه)`, services: p.services })));
        setServices(servicesRes.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)` })));
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب البيانات');
      }
    };

    fetchData();
  }, [page, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch({ ...search, [name]: value });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
      ...(name === 'packageId' ? { returnedServices: [] } : {}),
    });
  };

  const handleReturnedServicesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      returnedServices: selectedOptions.map(option => ({
        serviceId: option.value,
        price: parseFloat(services.find(s => s.value === option.value)?.label.match(/\d+/)?.[0]) || 0,
      })),
    });
  };

  const handleAdditionalServiceChange = (selectedOption) => {
    setFormData({
      ...formData,
      additionalService: {
        serviceId: selectedOption ? selectedOption.value : '',
        price: selectedOption ? parseFloat(services.find(s => s.value === selectedOption.value)?.label.match(/\d+/)?.[0]) || 0 : 0,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/bookings', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الحجز بنجاح');
      setShowModal(false);
      setFormData({
        packageId: '',
        hennaPackageId: '',
        photoPackageId: '',
        returnedServices: [],
        additionalService: { serviceId: '', price: 0 },
        clientName: '',
        clientPhone: '',
        city: '',
        eventDate: '',
        hennaDate: '',
        hairStraightening: false,
        hairStraighteningPrice: 0,
        hairStraighteningDate: '',
      });
      const bookingsRes = await axios.get(`http://localhost:5000/api/bookings?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إضافة الحجز');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(search).toString();
      const response = await axios.get(`http://localhost:5000/api/bookings/search?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في البحث');
    }
  };

  // جلب خدمات الباكدج المختار فقط
  const selectedPackage = packages.find(p => p.value === formData.packageId);
  const packageServices = selectedPackage ? services.filter(s => selectedPackage.services.some(ps => ps._id === s.value)) : [];

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>حجز ميك اب</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSearch} className="mb-3">
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>اسم العميل</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={search.clientName}
                    onChange={handleSearchChange}
                    placeholder="أدخل اسم العميل"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>رقم الهاتف</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientPhone"
                    value={search.clientPhone}
                    onChange={handleSearchChange}
                    placeholder="أدخل رقم الهاتف"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>تاريخ الحدث</Form.Label>
                  <Form.Control
                    type="date"
                    name="eventDate"
                    value={search.eventDate}
                    onChange={handleSearchChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="secondary" type="submit" className="mt-3">
              بحث
            </Button>
          </Form>
          <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
            حجز جديد
          </Button>
          <Row>
            {bookings.map(booking => (
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
                    <Button variant="primary" onClick={() => window.open(`/receipt/${booking._id}`, '_blank')} className="me-2">
                      طباعة
                    </Button>
                    <Button variant="warning" onClick={() => navigate(`/edit-booking/${booking._id}`)} className="me-2">
                      تعديل
                    </Button>
                    <Button variant="info" onClick={() => navigate(`/booking/${booking._id}`)} className="me-2">
                      تفاصيل
                    </Button>
                    <Button variant="success" onClick={() => navigate(`/installment/${booking._id}`)}>
                      إضافة قسط
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Button variant="outline-primary" onClick={() => setPage(page - 1)} disabled={page === 1} className="me-2">
            الصفحة السابقة
          </Button>
          <Button variant="outline-primary" onClick={() => setPage(page + 1)}>
            الصفحة التالية
          </Button>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>إضافة حجز جديد</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>نوع الباكدج</Form.Label>
                  <Select
                    options={packages}
                    value={packages.find(p => p.value === formData.packageId)}
                    onChange={(option) => handleSelectChange('packageId', option)}
                    placeholder="اختر الباكدج"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>باكدج الحنة (اختياري)</Form.Label>
                  <Select
                    options={packages.filter(p => p.label.includes('ميك اب'))}
                    value={packages.find(p => p.value === formData.hennaPackageId)}
                    onChange={(option) => handleSelectChange('hennaPackageId', option)}
                    placeholder="اختر باكدج الحنة"
                    isClearable
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>باكدج التصوير (اختياري)</Form.Label>
                  <Select
                    options={packages.filter(p => p.label.includes('تصوير'))}
                    value={packages.find(p => p.value === formData.photoPackageId)}
                    onChange={(option) => handleSelectChange('photoPackageId', option)}
                    placeholder="اختر باكدج التصوير"
                    isClearable
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>مرتجع من الباكدجات (اختياري)</Form.Label>
                  <Select
                    isMulti
                    options={packageServices}
                    value={packageServices.filter(s => formData.returnedServices.some(rs => rs.serviceId === s.value))}
                    onChange={handleReturnedServicesChange}
                    placeholder="اختر الخدمات المرتجعة"
                    isDisabled={!formData.packageId}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>خدمة إضافية (اختياري)</Form.Label>
                  <Select
                    options={services}
                    value={services.find(s => s.value === formData.additionalService.serviceId)}
                    onChange={handleAdditionalServiceChange}
                    placeholder="اختر خدمة إضافية"
                    isClearable
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>اسم العميل</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم العميل"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>رقم الهاتف</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم الهاتف"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>المدينة</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="أدخل المدينة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>تاريخ الحدث</Form.Label>
                  <Form.Control
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {formData.hennaPackageId && (
                  <Form.Group className="mb-3">
                    <Form.Label>تاريخ الحنة</Form.Label>
                    <Form.Control
                      type="date"
                      name="hennaDate"
                      value={formData.hennaDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="فرد الشعر"
                    name="hairStraightening"
                    checked={formData.hairStraightening}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {formData.hairStraightening && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>سعر فرد الشعر</Form.Label>
                      <Form.Control
                        type="number"
                        name="hairStraighteningPrice"
                        value={formData.hairStraighteningPrice}
                        onChange={handleInputChange}
                        placeholder="أدخل سعر فرد الشعر"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>تاريخ فرد الشعر</Form.Label>
                      <Form.Control
                        type="date"
                        name="hairStraighteningDate"
                        value={formData.hairStraighteningDate}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </>
                )}
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)} className="ms-2">
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingPage;