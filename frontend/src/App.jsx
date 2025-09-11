import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';

// Dashboards
import StudentDashboard from './pages/dashboard/StudentDashboard';
import PGOwnerDashboard from './pages/dashboard/PGOwnerDashboard';
import LaundryDashboard from './pages/dashboard/LaundryDashboard';
import ServiceDashboard from './pages/dashboard/ServiceDashboard';
import MessOwnerDashboard from './pages/dashboard/MessOwnerDashboard';

// Other Pages
import AddListing from "./pages/dashboard/AddListing";
import AddMessListing from "./pages/dashboard/AddMessListing"; // ✅ NEW

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about-us" element={<AboutUs />} />

        {/* Dashboards */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/pgowner" element={<PGOwnerDashboard />} />
        <Route path="/dashboard/laundry" element={<LaundryDashboard />} />
        <Route path="/dashboard/service" element={<ServiceDashboard />} />
        <Route path="/dashboard/messowner" element={<MessOwnerDashboard />} />

        {/* Other Pages */}
        <Route path="/dashboard/add-listing" element={<AddListing />} />
        <Route path="/dashboard/add-mess" element={<AddMessListing />} /> {/* ✅ NEW */}
      </Routes>
    </Router>
  );
}

export default App;
