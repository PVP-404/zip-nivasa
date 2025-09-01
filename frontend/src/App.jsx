import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/dashboard/StudentDashboard';
import PGOwnerDashboard from './pages/dashboard/PGOwnerDashboard';
import LaundryDashboard from './pages/dashboard/LaundryDashboard';
import ServiceDashboard from './pages/dashboard/ServiceDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/pgowner" element={<PGOwnerDashboard />} />
        <Route path="/dashboard/laundry" element={<LaundryDashboard />} />
        <Route path="/dashboard/service" element={<ServiceDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
