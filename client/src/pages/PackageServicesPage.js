// client/src/pages/PackageServicesPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/PackageServices.css';

function PackageServicesPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
  });
  const [editData, setEditData] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const API_BASE_URL = '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/packageServices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب الخدمات بنجاح', { toastId: 'package-services-fetch' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب الخدمات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'package-services-fetch-error' });
          hasFetched.current = true;
        }
      }
    };

    fetchServices();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const setData = editData ? setEditData : setFormData;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/packageServices`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الخدمة بنجاح');
      toast.success('تم إنشاء الخدمة بنجاح', { toastId: 'package-services-create' });
      setFormData({ name: '', price: '' });
      setShowAddModal(false);
      const response = await axios.get(`${API_BASE_URL}/packageServices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'package-services-create-error' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/packageServices/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الخدمة بنجاح');
      toast.success('تم تعديل الخدمة بنجاح', { toastId: `package-services-update-${editData._id}` });
      setEditData(null);
      setShowEditModal(false);
      const response = await axios.get(`${API_BASE_URL}/packageServices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في تعديل الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `package-services-update-error-${editData._id}` });
    }
  };

  const handleEdit = (service) => {
    setEditData({
      _id: service._id,
      name: service.name,
      price: service.price,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/packageServices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الخدمة بنجاح');
      toast.success('تم حذف الخدمة بنجاح', { toastId: `package-services-delete-${id}` });
      setServices(services.filter(s => s._id !== id));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في حذف الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `package-services-delete-error-${id}` });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>خدمات الباكدجات</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-3">
            إضافة خدمة جديدة
          </Button>
          <h4>قائمة خدمات الباكدجات</h4>
          <Row>
            {services.map(service => (
              <Col md={4} key={service._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{service.name}</Card.Title>
                    <Card.Text>
                      السعر: {service.price} جنيه
                    </Card.Text>
                    <Button variant="warning" onClick={() => handleEdit(service)} className="me-2">
                      تعديل
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(service._id)}>
                      حذف
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>إضافة خدمة جديدة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الخدمة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="أدخل السعر"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="ms-2">
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تعديل خدمة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editData?.name || ''}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الخدمة"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editData?.price || ''}
                    onChange={handleInputChange}
                    placeholder="أدخل السعر"
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  حفظ
                </Button>
                <Button variant="secondary" onClick={() => setShowEditModal(false)} className="ms-2">
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

export default PackageServicesPage;
