// client/src/pages/ServicePage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/Service.css';

function ServicePage() {
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showEditServicesModal, setShowEditServicesModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', price: '' });
  const [executeForm, setExecuteForm] = useState({ serviceIds: [], employeeId: '', price: 0 });
  const [editServiceForm, setEditServiceForm] = useState({ id: '', name: '', price: '' });
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        console.log('Fetching services, employees, and executions...');
        const [servicesRes, employeesRes, executionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/services/execute`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log('Services response:', servicesRes.data);
        console.log('Employees response:', employeesRes.data);
        console.log('Executions response:', executionsRes.data);
        setServices(servicesRes.data.map(s => ({
          value: s._id,
          label: `${s.name} (${s.price} جنيه)`,
          price: s.price,
        })));
        setEmployees(employeesRes.data.map(e => ({
          value: e._id,
          label: e.name,
        })));
        setExecutions(executionsRes.data);
        if (!hasFetched.current) {
          toast.success('تم جلب البيانات بنجاح', { toastId: 'services-fetch' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب البيانات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'services-fetch-error' });
          hasFetched.current = true;
        }
        console.error('Fetch data error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm({ ...serviceForm, [name]: value });
  };

  const handleExecuteInputChange = (e) => {
    const { name, value } = e.target;
    setExecuteForm({ ...executeForm, [name]: value });
  };

  const handleEditServiceInputChange = (e) => {
    const { name, value } = e.target;
    setEditServiceForm({ ...editServiceForm, [name]: value });
  };

  const handleExecuteSelectChange = (name, selectedOption) => {
    if (name === 'serviceIds') {
      const selectedServices = selectedOption || [];
      const totalPrice = selectedServices.reduce((sum, option) => sum + (services.find(s => s.value === option.value)?.price || 0), 0);
      setExecuteForm({
        ...executeForm,
        serviceIds: selectedServices.map(option => option.value),
        price: totalPrice,
      });
    } else {
      setExecuteForm({ ...executeForm, [name]: selectedOption ? selectedOption.value : '' });
    }
    console.log('Updated executeForm:', { ...executeForm, [name]: selectedOption ? selectedOption.value : selectedOption });
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Adding new service:', serviceForm);
      await axios.post(`${API_BASE_URL}/services`, serviceForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء الخدمة بنجاح');
      toast.success('تم إنشاء الخدمة بنجاح', { toastId: 'services-create' });
      setServiceForm({ name: '', price: '' });
      setShowAddServiceModal(false);
      const servicesRes = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(servicesRes.data.map(s => ({
        value: s._id,
        label: `${s.name} (${s.price} جنيه)`,
        price: s.price,
      })));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'services-create-error' });
      console.error('Add service error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSubmit = async (e) => {
    e.preventDefault();
    console.log('Execute form state before submission:', executeForm);
    if (!executeForm.serviceIds.length || !executeForm.employeeId || executeForm.price <= 0) {
      setError('يرجى اختيار خدمة واحدة على الأقل، موظف، وسعر صحيح');
      toast.error('يرجى اختيار خدمة واحدة على الأقل، موظف، وسعر صحيح', { toastId: 'services-execute-error' });
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        serviceIds: executeForm.serviceIds,
        employeeId: executeForm.employeeId,
        price: parseFloat(executeForm.price),
      };
      console.log('Executing service payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/services/execute`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تسجيل الخدمة المنفذة بنجاح');
      toast.success('تم تسجيل الخدمة المنفذة بنجاح', { toastId: 'services-execute' });
      setExecuteForm({ serviceIds: [], employeeId: '', price: 0 });
      setShowExecuteModal(false);
      const executionsRes = await axios.get(`${API_BASE_URL}/services/execute`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExecutions(executionsRes.data);
      // فتح صفحة الوصل أوتوماتيكي
      window.open(`/service-receipt/${response.data.serviceExecution._id}`, '_blank');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في تسجيل الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'services-execute-error' });
      console.error('Execute service error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditServiceForm({
      id: service.value,
      name: service.label.split(' (')[0],
      price: service.price,
    });
    setShowEditServiceModal(true);
  };

  const handleEditServiceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Editing service:', editServiceForm);
      await axios.put(`${API_BASE_URL}/services/${editServiceForm.id}`, {
        name: editServiceForm.name,
        price: parseFloat(editServiceForm.price) || 0,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم تعديل الخدمة بنجاح');
      toast.success('تم تعديل الخدمة بنجاح', { toastId: `services-edit-${editServiceForm.id}` });
      setEditServiceForm({ id: '', name: '', price: '' });
      setShowEditServiceModal(false);
      const servicesRes = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(servicesRes.data.map(s => ({
        value: s._id,
        label: `${s.name} (${s.price} جنيه)`,
        price: s.price,
      })));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في تعديل الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `services-edit-error-${editServiceForm.id}` });
      console.error('Edit service error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting service:', serviceId);
      await axios.delete(`${API_BASE_URL}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الخدمة بنجاح');
      toast.success('تم حذف الخدمة بنجاح', { toastId: `services-delete-${serviceId}` });
      const servicesRes = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(servicesRes.data.map(s => ({
        value: s._id,
        label: `${s.name} (${s.price} جنيه)`,
        price: s.price,
      })));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في حذف الخدمة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `services-delete-error-${serviceId}` });
      console.error('Delete service error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExecution = async (executionId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting execution:', executionId);
      await axios.delete(`${API_BASE_URL}/services/execute/${executionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم حذف الخدمة المنفذة بنجاح');
      toast.success('تم حذف الخدمة المنفذة بنجاح', { toastId: `execution-delete-${executionId}` });
      const executionsRes = await axios.get(`${API_BASE_URL}/services/execute`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExecutions(executionsRes.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في حذف الخدمة المنفذة';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: `execution-delete-error-${executionId}` });
      console.error('Delete execution error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = (executionId) => {
    window.open(`/service-receipt/${executionId}`, '_blank');
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>خدمات فورية</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {isLoading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => setShowAddServiceModal(true)}
            className="mb-3 me-2"
            disabled={isLoading}
          >
            إضافة خدمة جديدة
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowExecuteModal(true)}
            className="mb-3 me-2"
            disabled={isLoading}
          >
            تسجيل خدمة منفذة
          </Button>
          <Button
            variant="warning"
            onClick={() => setShowEditServicesModal(true)}
            className="mb-3"
            disabled={isLoading}
          >
            تعديل الخدمات
          </Button>
          <h4>الخدمات المنفذة</h4>
          <Row>
            {executions.map(execution => (
              <Col md={4} key={execution._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>
                      {execution.serviceIds?.length > 0
                        ? execution.serviceIds
                            .map(id => services.find(s => s.value === id)?.label.split(' (')[0] || 'خدمة غير معروفة')
                            .join(', ')
                        : 'خدمة غير معروفة'}
                    </Card.Title>
                    <Card.Text>
                      <strong>الموظف:</strong> {execution.employeeId?.name || 'غير محدد'}<br />
                      <strong>السعر:</strong> {execution.price || 0} جنيه<br />
                      <strong>الحالة:</strong> {execution.executionStatus === 'pending' ? 'في الانتظار' : execution.executionStatus === 'in_progress' ? 'قيد التنفيذ' : 'نُفذت'}<br />
                      <strong>بواسطة:</strong> {execution.executedBy?.username || 'غير محدد'}<br />
                      <strong>التاريخ:</strong> {new Date(execution.createdAt).toLocaleDateString('ar-EG')}
                    </Card.Text>
                    <div className="text-center">
                      <QRCodeCanvas value={execution.receiptNumber || ''} size={128} />
                      <p><strong>رقم الوصل:</strong> {execution.receiptNumber || 'غير متوفر'}</p>
                      <Button
                        variant="primary"
                        onClick={() => handlePrintReceipt(execution._id)}
                        className="mt-2 me-2"
                        disabled={isLoading}
                      >
                        طباعة
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteExecution(execution._id)}
                        className="mt-2"
                        disabled={isLoading}
                      >
                        حذف
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Modal show={showAddServiceModal} onHide={() => setShowAddServiceModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>إضافة خدمة فورية</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddServiceSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={serviceForm.name}
                    onChange={handleServiceInputChange}
                    placeholder="أدخل اسم الخدمة"
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={serviceForm.price}
                    onChange={handleServiceInputChange}
                    placeholder="أدخل السعر"
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}جاري التحميل...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddServiceModal(false)}
                  className="ms-2"
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={showExecuteModal} onHide={() => setShowExecuteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تسجيل خدمة منفذة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleExecuteSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>الخدمات</Form.Label>
                  <Select
                    isMulti
                    options={services}
                    onChange={(option) => handleExecuteSelectChange('serviceIds', option)}
                    placeholder="اختر الخدمات"
                    isDisabled={isLoading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>الموظف</Form.Label>
                  <Select
                    options={employees}
                    onChange={(option) => handleExecuteSelectChange('employeeId', option)}
                    placeholder="اختر الموظف"
                    isDisabled={isLoading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر الإجمالي</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={executeForm.price}
                    onChange={handleExecuteInputChange}
                    placeholder="السعر الإجمالي"
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !executeForm.serviceIds.length || !executeForm.employeeId || executeForm.price <= 0}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}جاري التحميل...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowExecuteModal(false)}
                  className="ms-2"
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal show={showEditServicesModal} onHide={() => setShowEditServicesModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تعديل الخدمات</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {services.length > 0 ? (
                <ListGroup>
                  {services.map(service => (
                    <ListGroup.Item key={service.value} className="d-flex justify-content-between align-items-center">
                      <span>{service.label}</span>
                      <div>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditService(service)}
                          disabled={isLoading}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteService(service.value)}
                          disabled={isLoading}
                        >
                          حذف
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>لا توجد خدمات فورية</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditServicesModal(false)}
                disabled={isLoading}
              >
                إغلاق
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showEditServiceModal} onHide={() => setShowEditServiceModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>تعديل خدمة</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditServiceSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الخدمة</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editServiceForm.name}
                    onChange={handleEditServiceInputChange}
                    placeholder="أدخل اسم الخدمة"
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>السعر</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editServiceForm.price}
                    onChange={handleEditServiceInputChange}
                    placeholder="أدخل السعر"
                    disabled={isLoading}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}جاري التحميل...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditServiceModal(false)}
                  className="ms-2"
                  disabled={isLoading}
                >
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

export default ServicePage;
