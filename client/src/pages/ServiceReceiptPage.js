// client/src/pages/ServiceReceiptPage.js
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import '../css/Receipt.css';

function ServiceReceiptPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
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

    const fetchReceipt = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/services/receipt/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Receipt data:', response.data);
        setReceipt(response.data);
        if (!hasFetched.current) {
          toast.success('تم جلب الوصل بنجاح', { toastId: `receipt-${id}` });
          hasFetched.current = true;
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'خطأ في جلب الوصل';
        setError(errorMessage);
        if (!hasFetched.current) {
          toast.error(errorMessage, { toastId: `receipt-error-${id}` });
          hasFetched.current = true;
        }
        console.error('Fetch receipt error:', err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="text-center m-3">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (!receipt) {
    return <div className="text-center m-3">لا يوجد وصل</div>;
  }

  console.log('Rendering receipt:', receipt);

  return (
    <Container className="receipt-container">
      <div className="receipt">
        <h2 className="text-center">وصل خدمة فورية</h2>
        <p><strong>رقم الوصل:</strong> {receipt.receiptNumber || 'غير متوفر'}</p>
        <hr />
        <h4>تفاصيل الخدمة</h4>
        <p>
          <strong>الخدمات:</strong>{' '}
          {receipt.services?.length > 0
            ? receipt.services.map(s => `${s.name} (${s.price} جنيه)`).join(', ')
            : 'لا توجد خدمات'}
        </p>
        <p><strong>الموظف:</strong> {receipt.employee || 'غير محدد'}</p>
        <p>
          <strong>السعر الإجمالي:</strong> {receipt.price || 0} جنيه
        </p>
        <p>
          <strong>الحالة:</strong>{' '}
          {receipt.status === 'pending' ? 'في الانتظار' : receipt.status === 'in_progress' ? 'قيد التنفيذ' : 'نُفذت'}
        </p>
        <p><strong>بواسطة:</strong> {receipt.executedBy || 'غير محدد'}</p>
        <p><strong>التاريخ:</strong> {receipt.createdAt || 'غير محدد'}</p>
        <p><strong>أنشأه:</strong> {receipt.createdBy || 'غير محدد'}</p>
        <div className="text-center mt-3">
          <QRCodeCanvas value={receipt.receiptNumber || ''} size={128} />
          <p><strong>رقم الوصل:</strong> {receipt.receiptNumber || 'غير متوفر'}</p>
        </div>
        <Button
          variant="primary"
          onClick={handlePrint}
          className="mt-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' '}جاري التحميل...
            </>
          ) : (
            'طباعة'
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/services')}
          className="mt-3 ms-2"
          disabled={isLoading}
        >
          رجوع
        </Button>
      </div>
    </Container>
  );
}

export default ServiceReceiptPage;
