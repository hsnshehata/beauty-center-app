// client/src/components/Sidebar.js
import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '←' : '→'}
      </button>
      {isOpen && (
        <Nav className="flex-column">
          {role === 'worker' ? (
            <Nav.Link href="/">الصفحة الرئيسية</Nav.Link>
          ) : (
            <>
              <Nav.Link href="/">الصفحة الرئيسية</Nav.Link>
              <Nav.Link href="/bookings">حجز ميك اب</Nav.Link>
              <Nav.Link href="/services">خدمات فورية</Nav.Link>
              <Nav.Link href="/expenses">المصروفات</Nav.Link>
              <Nav.Link href="/advances">سلف الموظفين</Nav.Link>
              <Nav.Link href="/reports/daily">التقارير اليومية</Nav.Link>
              {role === 'admin' && (
                <>
                  <Nav.Link href="/users">إضافة مسؤول</Nav.Link>
                  <Nav.Link href="/packageServices">خدمات الباكدجات</Nav.Link>
                  <Nav.Link href="/packages">إضافة باكدجات</Nav.Link>
                  <Nav.Link href="/reports/employees">تقارير الموظفين</Nav.Link>
                </>
              )}
              {(role === 'admin' || role === 'supervisor') && (
                <Nav.Link href="/employees">إضافة موظف</Nav.Link>
              )}
            </>
          )}
          <Nav.Link onClick={handleLogout}>تسجيل الخروج</Nav.Link>
        </Nav>
      )}
    </div>
  );
}

export default Sidebar;