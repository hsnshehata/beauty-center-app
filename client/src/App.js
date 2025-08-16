// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ReceiptPage from './pages/ReceiptPage';
import BookingPage from './pages/BookingPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/receipt/:id" element={<ReceiptPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/booking/:id" element={<BookingDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;