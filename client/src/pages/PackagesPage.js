// client/src/pages/PackagesPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/Packages.css';

function PackagesPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'makeup',
    services: [],
  });
  const [editData, setEditData] = useState(null);
  const [packages, setPackages] = useState([]);
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

    const fetchData = async () => {
      try {
        const [packagesRes, servicesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/packages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/packageServices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPackages(packagesRes.data);
        setServices(servicesRes.data.map(s => ({ value: s._id, label: `${s.name} (${s.price} جنيه)` })));
        if (!hasFetched.current) {
          toast.success('تم جلب الباكدجات بنجاح', { toastId: 'packages-fetch' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب البيانات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'packages-fetch-error' });
          hasFetched.current = true;
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const setData = editData ? setEditData : setFormData;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleServicesChange = (selectedOptions) => {
    const setData = editData ? setEditData : setFormData;
    setData(prev => ({ ...prev, services: selectedOptions.map(option => option.value) }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/packages`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الباكدج بنجاح');
      toast.success('تم إنشاء الباكدج بنجاح', { toastId: 'packages-create' });
      setFormData({ name: '', price: '', type: 'makeup', services: [] });
      setShowAddModal(false);
      const response = await axios.get(`${API_BASE_URL}/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء الباكدج';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'packages-create-error' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/packages/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الباكدج بنجاح');
      toast.success('تم تعديل الباكدج بنجاح', { toastId: `packages-update-${editData._id}` });
      setEditData(null);
      setShowEditModal(false);
      const response = await axios.get(`${API_BASE_URL}/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في تعديل الباكدج';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `packages-update-error-${editData._id}` });
    }
  };

  const handleEdit = (pkg) => {
    setEditData({
      _id: pkg._id,
      name: pkg.name,
      price: pkg.price,
      type: pkg.type,
      services: pkg.services.map(s => s._id),
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الباكدج بنجاح');
      toast.success('تم حذف الباكدج بنجاح', { toastId: `packages-delete-${id}` });
      setPackages(packages.filter(pkg => pkg._id !== id));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في حذف الباكدج';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `packages-delete-error-${id}` });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>إضافة خدمات/باكدجات</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-3">
            إضافة باكدج جديد
          </Button>
          <h4>قائمة الباكدجات</h4>
          <Row>
            {packages.map(pkg => (
              <Col md={4} key={pkg._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{pkg.name}</Card.Title>
                    <Card.Text>
                      السعر: {pkg.price} جنيه<br />
                      النوع: {pkg.type === 'makeup' ? 'ميك اب' : 'تصوير'}<br />
                      الخدمات: {pkg.services.map(s => s.name).join(', ') || 'لا توجد خدمات'}
                    </Card.Text>
                    <Button variant="warning" onClick={() => handleEdit(pkg)} className="me-2">
                      تعديل
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(pkg._id)}>
                      حذف
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>إضافة باكدج جديد</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الباكدج</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الباكدج"
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
                <Form.Group className="mb-3">
                  <Form.Label>النوع</Form.Label>
                  <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="makeup">ميك اب</option>
                    <option value="photo">تصوير</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الخدمات</Form.Label>
                  <Select
                    isMulti
                    options={services}
                    value={services.filter(s => formData.services.includes(s.value))}
                    onChange={handleServicesChange}
                    placeholder="اختر الخدمات"
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
              <Modal.Title>تعديل باكدج</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الباكدج</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editData?.name || ''}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الباكدج"
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
                <Form.Group className="mb-3">
                  <Form.Label>النوع</Form.Label>
                  <Form.Select name="type" value={editData?.type || 'makeup'} onChange={handleInputChange}>
                    <option value="makeup">ميك اب</option>
                    <option value="photo">تصوير</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الخدمات</Form.Label>
                  <Select
                    isMulti
                    options={services}
                    value={services.filter(s => editData?.services.includes(s.value))}
                    onChange={handleServicesChange}
                    placeholder="اختر الخدمات"
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

export default PackagesPage;
