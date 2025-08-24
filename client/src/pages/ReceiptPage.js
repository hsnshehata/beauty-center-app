// client/src/pages/ReceiptPage.js
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import '../css/Receipt.css';

function ReceiptPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${id}/receipt`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceipt(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب بيانات الوصل بنجاح', { toastId: `receipt-fetch-${id}` });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب بيانات الوصل';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: `receipt-fetch-error-${id}` });
          hasFetched.current = true;
        }
      }
    };

    fetchReceipt();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (!receipt) {
    return <div className="text-center m-3">جاري التحميل...</div>;
  }

  return (
    <Container className="receipt-container">
      <div className="receipt">
        <h2 className="text-center">وصل حجز</h2>
        <p><strong>اسم العميل:</strong> {receipt.clientName}</p>
        <p><strong>رقم الهاتف:</strong> {receipt.clientPhone}</p>
        <p><strong>المدينة:</strong> {receipt.city}</p>
        <p><strong>تاريخ الحدث:</strong> {receipt.eventDate}</p>
        <hr />
        <h4>تفاصيل الحجز</h4>
        <p><strong>الباكدج الرئيسي:</strong> {receipt.package.name} - {receipt.package.price} جنيه</p>
        {receipt.hennaPackage && (
          <p><strong>باكدج الحنة:</strong> {receipt.hennaPackage.name} - {receipt.hennaPackage.price} جنيه (تاريخ: {receipt.hennaPackage.date})</p>
        )}
        {receipt.photoPackage && (
          <p><strong>باكدج التصوير:</strong> {receipt.photoPackage.name} - {receipt.photoPackage.price} جنيه</p>
        )}
        {receipt.returnedServices.length > 0 && (
          <>
            <h5>الخدمات المرتجعة:</h5>
            {receipt.returnedServices.map((rs, index) => (
              <p key={index}>{rs.name} - ({rs.price} جنيه)</p>
            ))}
          </>
        )}
        {receipt.additionalService && (
          <p><strong>خدمة إضافية:</strong> {receipt.additionalService.name} - {receipt.additionalService.price} جنيه</p>
        )}
        {receipt.hairStraightening && (
          <p><strong>فرد الشعر:</strong> {receipt.hairStraighteningPrice} جنيه (تاريخ: {receipt.hairStraighteningDate})</p>
        )}
        <hr />
        <p><strong>الإجمالي:</strong> {receipt.totalPrice} جنيه</p>
        <p><strong>تم الإنشاء بواسطة:</strong> {receipt.createdBy}</p>
        <p><strong>تاريخ الإنشاء:</strong> {receipt.createdAt}</p>
        <div className="text-center mt-3">
          <QRCodeCanvas value={id} size={128} />
          <p><strong>رقم الوصل:</strong> {id}</p>
        </div>
        <Button variant="primary" onClick={handlePrint} className="mt-3">
          طباعة
        </Button>
      </div>
    </Container>
  );
}

export default ReceiptPage;