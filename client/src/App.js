// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ReceiptPage from './pages/ReceiptPage';
import BookingPage from './pages/BookingPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import InstallmentPage from './pages/InstallmentPage';
import EditBookingPage from './pages/EditBookingPage';
import ServicePage from './pages/ServicePage';
import ServiceReceiptPage from './pages/ServiceReceiptPage'; // أضفنا الصفحة الجديدة
import UsersPage from './pages/UsersPage';
import PackagesPage from './pages/PackagesPage';
import DailyReportsPage from './pages/DailyReportsPage';
import EmployeeReportsPage from './pages/EmployeeReportsPage';
import EmployeesPage from './pages/EmployeesPage';
import ExpensesPage from './pages/ExpensesPage';
import AdvancesPage from './pages/AdvancesPage';
import PackageServicesPage from './pages/PackageServicesPage';
import WorkerDashboard from './pages/WorkerDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-left" autoClose={2000} hideProgressBar={false} closeOnClick />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/receipt/:id" element={<ReceiptPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/booking/:id" element={<BookingDetailsPage />} />
          <Route path="/installment/:id" element={<InstallmentPage />} />
          <Route path="/edit-booking/:id" element={<EditBookingPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/service-receipt/:id" element={<ServiceReceiptPage />} /> {/* أضفنا الروت الجديد */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/reports/daily" element={<DailyReportsPage />} />
          <Route path="/reports/employees" element={<EmployeeReportsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/advances" element={<AdvancesPage />} />
          <Route path="/packageServices" element={<PackageServicesPage />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;