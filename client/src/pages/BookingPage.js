// client/src/pages/BookingPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/App.css';

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
        setPackages(packagesRes.data.map(p => ({ value: p._id, label: `${p.name} (${p.price} جنيه)`, services: p.services, price: p.price, type: p.type })));
        setServices(servicesRes.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)`, price: s.price })));
        toast.success('تم جلب الحجوزات بنجاح');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب البيانات';
        setError(errorMessage);
        toast.error(errorMessage);
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
        deposit: parseFloat(formData.deposit) || 0,
        hairStraighteningPrice: parseFloat(formData.hairStraighteningPrice) || 0,
      };
      await axios.post('http://localhost:5000/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الحجز بنجاح');
      toast.success('تم إنشاء الحجز بنجاح');
      setShowModal(false);
      setFormData({
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
      const bookingsRes = await axios.get(`http://localhost:5000/api/bookings?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إضافة الحجز';
      setError(errorMessage);
      toast.error(errorMessage);
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
      toast.success('تم البحث بنجاح');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في البحث';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الحجز بنجاح');
      toast.success('تم حذف الحجز بنجاح');
      setBookings(bookings.filter(booking => booking._id !== id));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في حذف الحجز';
      setError(errorMessage);
      toast.error(errorMessage);
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
          <h2>إدارة الحجوزات</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
            إضافة حجز جديد
          </Button>
          <Form onSubmit={handleSearch} className="mb-3">
            <Row>
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={3} className="d-flex align-items-end">
                <Button variant="primary" type="submit">
                  بحث
                </Button>
              </Col>
            </Row>
          </Form>
          <Row>
            {bookings.map(booking => (
              <Col md={4} key={booking._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{booking.clientName}</Card.Title>
                    <Card.Text>
                      <strong>الخدمة:</strong> {booking.packageId?.type === 'makeup' ? `ميك اب - ${booking.packageId?.name}` : booking.hairStraightening ? 'فرد الشعر' : `تصوير - ${booking.photoPackageId?.name}`}<br />
                      <strong>الإجمالي:</strong> {booking.totalPrice} جنيه<br />
                      <strong>المدفوع:</strong> {booking.totalPaid} جنيه<br />
                      <strong>الباقي:</strong> {booking.remainingBalance} جنيه
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
                    <Button variant="success" onClick={() => navigate(`/installment/${booking._id}`)} className="me-2">
                      إضافة قسط
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(booking._id)}>
                      حذف
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-between mt-3">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              الصفحة السابقة
            </Button>
            <Button onClick={() => setPage(page + 1)}>
              الصفحة التالية
            </Button>
          </div>
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