// client/src/pages/EditBookingPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Modal, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

function EditBookingPage() {
  const { id } = useParams();
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    packageId: '',
    hennaPackageId: null,
    photoPackageId: null,
    returnedServices: [],
    additionalService: { serviceId: null, price: 0 },
    clientName: '',
    clientPhone: '',
    city: '',
    eventDate: '',
    hennaDate: '',
    hairStraightening: false,
    hairStraighteningPrice: 0,
    hairStraighteningDate: '',
    deposit: 0,
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
          axios.get('http://localhost:5000/api/packageServices', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const booking = bookingRes.data;
        setFormData({
          packageId: booking.package ? booking.package._id || '' : '',
          hennaPackageId: booking.hennaPackage ? booking.hennaPackage._id || null : null,
          photoPackageId: booking.photoPackage ? booking.photoPackage._id || null : null,
          returnedServices: (booking.returnedServices || []).map(rs => ({
            serviceId: rs.serviceId ? rs.serviceId._id || null : null,
            price: parseFloat(rs.price) || 0,
          })),
          additionalService: booking.additionalService && booking.additionalService.serviceId ? {
            serviceId: booking.additionalService.serviceId._id || null,
            price: parseFloat(booking.additionalService.price) || 0,
          } : { serviceId: null, price: 0 },
          clientName: booking.clientName || '',
          clientPhone: booking.clientPhone || '',
          city: booking.city || '',
          eventDate: booking.eventDate || '',
          hennaDate: booking.hennaPackage ? booking.hennaPackage.date || '' : '',
          hairStraightening: !!booking.hairStraightening, // تحويل إلى boolean
          hairStraighteningPrice: parseFloat(booking.hairStraighteningPrice) || 0,
          hairStraighteningDate: booking.hairStraighteningDate || '',
          deposit: parseFloat(booking.deposit) || 0,
        });
        setPackages(packagesRes.data.map(p => ({
          value: p._id,
          label: `${p.name} (${p.price} جنيه)`,
          services: p.services || [],
          price: p.price,
          type: p.type,
        })));
        setServices(servicesRes.data.map(s => ({
          value: s._id,
          label: `${s.name} (${s.price} جنيه)`,
          price: s.price,
        })));
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
      [name]: selectedOption ? selectedOption.value : null,
      ...(name === 'packageId' ? { returnedServices: [] } : {}),
    });
  };

  const handleReturnedServicesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      returnedServices: selectedOptions.map(option => ({
        serviceId: option.value,
        price: parseFloat(services.find(s => s.value === option.value)?.price) || 0,
      })),
    });
  };

  const handleAdditionalServiceChange = (selectedOption) => {
    setFormData({
      ...formData,
      additionalService: {
        serviceId: selectedOption ? selectedOption.value : null,
        price: selectedOption ? parseFloat(services.find(s => s.value === selectedOption.value)?.price) || 0 : 0,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        hennaPackageId: formData.hennaPackageId || null,
        photoPackageId: formData.photoPackageId || null,
        additionalService: formData.additionalService.serviceId ? formData.additionalService : null,
        hairStraightening: !!formData.hairStraightening, // تحويل إلى boolean
        deposit: parseFloat(formData.deposit) || 0,
        hairStraighteningPrice: parseFloat(formData.hairStraighteningPrice) || 0,
      };
      await axios.put(`http://localhost:5000/api/bookings/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الحجز بنجاح');
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تعديل الحجز');
      console.error('خطأ في الفرونت إند:', err.response?.data);
    }
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;

    if (formData.packageId) {
      const pkg = packages.find(p => p.value === formData.packageId);
      totalPrice += parseFloat(pkg?.price) || 0;
    }

    if (formData.hennaPackageId) {
      const hennaPkg = packages.find(p => p.value === formData.hennaPackageId);
      totalPrice += parseFloat(hennaPkg?.price) || 0;
    }

    if (formData.photoPackageId) {
      const photoPkg = packages.find(p => p.value === formData.photoPackageId);
      totalPrice += parseFloat(photoPkg?.price) || 0;
    }

    if (formData.returnedServices.length > 0) {
      totalPrice -= formData.returnedServices.reduce((sum, rs) => sum + parseFloat(rs.price) || 0, 0);
    }

    if (formData.additionalService.serviceId) {
      totalPrice += parseFloat(formData.additionalService.price) || 0;
    }

    if (formData.hairStraightening && formData.hairStraighteningPrice) {
      totalPrice += parseFloat(formData.hairStraighteningPrice) || 0;
    }

    return totalPrice >= 0 ? totalPrice : 0;
  };

  const totalPrice = calculateTotalPrice();
  const deposit = parseFloat(formData.deposit) || 0;
  const remainingBalance = totalPrice - deposit;

  const selectedPackage = packages.find(p => p.value === formData.packageId);
  const packageServices = selectedPackage ? services.filter(s => selectedPackage.services.some(ps => ps._id === s.value)) : [];

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
          <Modal show={true} onHide={() => navigate('/bookings')}>
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
                <Form.Group className="mb-3">
                  <Form.Label>العربون</Form.Label>
                  <Form.Control
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    placeholder="أدخل مبلغ العربون"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الإجمالي</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${totalPrice} جنيه`}
                    readOnly
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الباقي</Form.Label>
                  <Form.Control
                    type="text"
                    value={`${remainingBalance} جنيه`}
                    readOnly
                  />
                </Form.Group>
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