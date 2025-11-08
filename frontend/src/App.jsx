// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";

// Dashboards
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import PGOwnerDashboard from "./pages/dashboard/PGOwnerDashboard";
import LaundryDashboard from "./pages/dashboard/LaundryDashboard";
import ServiceDashboard from "./pages/dashboard/ServiceDashboard";
import MessOwnerDashboard from "./pages/dashboard/MessOwnerDashboard";

// Other Pages
import AddListing from "./pages/dashboard/AddListing";
import AddMessListing from "./pages/dashboard/AddMessListing";

// Auth Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />

        {/* Student Dashboard */}
        <Route
          path="/dashboard/student"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <StudentDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* PG Owner Dashboard */}
        <Route
          path="/dashboard/pgowner"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <PGOwnerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Mess Owner Dashboard */}
        <Route
          path="/dashboard/messowner"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <MessOwnerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Laundry Owner Dashboard */}
        <Route
          path="/dashboard/laundry"
          element={
            <RoleProtectedRoute allowedRoles={["laundry"]}>
              <LaundryDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Service Provider Dashboard */}
        <Route
          path="/dashboard/service"
          element={
            <RoleProtectedRoute allowedRoles={["service"]}>
              <ServiceDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Add Listing PG (Only PG Owner) */}
        <Route
          path="/dashboard/add-listing"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <AddListing />
            </RoleProtectedRoute>
          }
        />

        {/* Add Listing Mess (Only Mess Owner) */}
        <Route
          path="/dashboard/add-mess"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <AddMessListing />
            </RoleProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
