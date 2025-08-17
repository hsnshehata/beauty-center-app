// client/src/pages/PackageServicesPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/packageServices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب الخدمات');
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
      await axios.post('http://localhost:5000/api/packageServices', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الخدمة بنجاح');
      setFormData({ name: '', price: '' });
      setShowAddModal(false);
      const response = await axios.get('http://localhost:5000/api/packageServices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء الخدمة');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/packageServices/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الخدمة بنجاح');
      setEditData(null);
      setShowEditModal(false);
      const response = await axios.get('http://localhost:5000/api/packageServices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تعديل الخدمة');
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
      await axios.delete(`http://localhost:5000/api/packageServices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الخدمة بنجاح');
      setServices(services.filter(s => s._id !== id));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في حذف الخدمة');
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