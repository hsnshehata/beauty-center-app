// client/src/pages/ExpensesPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import '../css/Expenses.css';

function ExpensesPage() {
  const [formData, setFormData] = useState({
    details: '',
    amount: '',
  });
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const API_BASE_URL = '/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب المصروفات بنجاح', { toastId: 'expenses-fetch' });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب المصروفات';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: 'expenses-fetch-error' });
          hasFetched.current = true;
        }
      }
    };

    fetchExpenses();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/expenses`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('تم إنشاء المصروف بنجاح');
      toast.success('تم إنشاء المصروف بنجاح', { toastId: 'expenses-create' });
      setFormData({ details: '', amount: '' });
      const response = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'خطأ في إنشاء المصروف';
      setError(errorMessage);
      toast.error(errorMessage, { toastId: 'expenses-create-error' });
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-4">
          <h2>المصروفات</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit} className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label>تفاصيل المصروف</Form.Label>
              <Form.Control
                type="text"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="أدخل تفاصيل المصروف"
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
          <h4>قائمة المصروفات</h4>
          <Row>
            {expenses.map(expense => (
              <Col md={4} key={expense._id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{expense.details}</Card.Title>
                    <Card.Text>
                      المبلغ: {expense.amount} جنيه<br />
                      بواسطة: {expense.createdBy.username}<br />
                      التاريخ: {new Date(expense.createdAt).toLocaleDateString('ar-EG')}
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

export default ExpensesPage;
