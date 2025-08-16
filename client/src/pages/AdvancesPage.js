// client/src/pages/AdvancesPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import '../css/Advances.css';

function AdvancesPage() {
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
  });
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [employeesRes, advancesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/employees', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/advances', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEmployees(employeesRes.data.map(e => ({ value: e._id, label: e.name })));
        setAdvances(advancesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'خطأ في جلب البيانات');
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({ ...formData, employeeId: selectedOption ? selectedOption.value : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/advances', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء السلفة بنجاح');
      setFormData({ employeeId: '', amount: '' });
      const response = await axios.get('http://localhost:5000/api/advances', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdvances(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء السلفة');
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>سلف الموظفين</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit} className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label>الموظف</Form.Label>
              <Select
                options={employees}
                onChange={handleSelectChange}
                placeholder="اختر الموظف"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>المبلغ</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="أدخل المبلغ"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              حفظ
            </Button>
          </Form>
          <h4>قائمة السلف</h4>
          <Row>
            {advances.map(advance => (
              <Col md={4} key={advance._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{advance.employeeId.name}</Card.Title>
                    <Card.Text>
                      المبلغ: {advance.amount} جنيه<br />
                      بواسطة: {advance.createdBy.username}<br />
                      التاريخ: {new Date(advance.createdAt).toLocaleDateString('ar-EG')}
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

export default AdvancesPage;