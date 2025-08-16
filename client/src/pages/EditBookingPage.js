// client/src/pages/EditBookingPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Modal, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/EditBooking.css';

function EditBookingPage() {
  const { id } = useParams();
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(true);
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
        const [bookingRes, packagesRes, servicesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/bookings/${id}/receipt`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/packages', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/services', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const booking = bookingRes.data;
        setFormData({
          packageId: booking.package ? booking.package._id : '',
          hennaPackageId: booking.hennaPackage ? booking.hennaPackage._id : '',
          photoPackageId: booking.photoPackage ? booking.photoPackage._id : '',
          returnedServices: booking.returnedServices.map(rs => ({
            serviceId: rs.serviceId._id,
            price: rs.price,
          })),
          additionalService: booking.additionalService ? {
            serviceId: booking.additionalService.serviceId._id,
            price: booking.additionalService.price,
          } : { serviceId: '', price: 0 },
          clientName: booking.clientName,
          clientPhone: booking.clientPhone,
          city: booking.city,
          eventDate: booking.eventDate,
          hennaDate: booking.hennaPackage ? booking.hennaPackage.date : '',
          hairStraightening: booking.hairStraightening,
          hairStraighteningPrice: booking.hairStraightening ? booking.hairStraightening.price : 0,
          hairStraighteningDate: booking.hairStraightening ? booking.hairStraightening.date : '',
        });
        setPackages(packagesRes.data.map(p => ({ value: p._id, label: `${p.name} (${p.price} جنيه)` })));
        setServices(servicesRes.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)` })));
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب البيانات');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : '',
    });
  };

  const handleReturnedServicesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      returnedServices: selectedOptions.map(option => ({
        serviceId: option.value,
        price: services.find(s => s.value === option.value)?.label.match(/\d+/)?.[0] || 0,
      })),
    });
  };

  const handleAdditionalServiceChange = (selectedOption) => {
    setFormData({
      ...formData,
      additionalService: {
        serviceId: selectedOption ? selectedOption.value : '',
        price: selectedOption ? services.find(s => s.value === selectedOption.value)?.label.match(/\d+/)?.[0] || 0 : 0,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الحجز بنجاح');
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تعديل الحجز');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>تعديل الحجز</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Modal show={showModal} onHide={() => navigate('/bookings')}>
            <Modal.Header closeButton>
              <Modal.Title>تعديل الحجز</Modal.Title>
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
                    options={services}
                    value={services.filter(s => formData.returnedServices.some(rs => rs.serviceId === s.value))}
                    onChange={handleReturnedServicesChange}
                    placeholder="اختر الخدمات المرتجعة"
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
                <Button variant="secondary" onClick={() => navigate('/bookings')} className="ms-2">
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

export default EditBookingPage;