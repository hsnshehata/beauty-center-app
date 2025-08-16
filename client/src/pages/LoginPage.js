// client/src/pages/LoginPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center">تسجيل الدخول</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin} className="w-50 mx-auto">
        <Form.Group className="mb-3">
          <Form.Label>اسم المستخدم</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>كلمة المرور</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          تسجيل الدخول
        </Button>
      </Form>
    </Container>
  );
}

export default LoginPage;