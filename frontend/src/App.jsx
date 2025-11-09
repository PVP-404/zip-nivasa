// ✅ frontend/src/App.jsx

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
import MessOwnerDashboard from "./pages/dashboard/MessOwnerDashboard";

// PG Pages
import AllPGs from "./pages/pgs/AllPGs";
import PGDetails from "./pages/pgs/PGDetails";

// Tenant Pages
import MyBookings from "./pages/tenant/MyBookings";
import Payments from "./pages/tenant/Payments";
import Complaints from "./pages/tenant/Complaints";
import Profile from "./pages/tenant/Profile";

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

        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />

        {/* ✅ PG LISTING PAGES (Public) */}
        <Route path="/pgs/all" element={<AllPGs />} />
        <Route path="/services/pg/:id" element={<PGDetails />} />

        {/* ✅ Student Dashboard */}
        <Route
          path="/dashboard/student"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <StudentDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Student Additional Pages */}
        <Route
          path="/dashboard/student/bookings"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <MyBookings />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/student/payments"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <Payments />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/student/complaints"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <Complaints />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/student/profile"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <Profile />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ PG Owner Dashboard */}
        <Route
          path="/dashboard/pgowner"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <PGOwnerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Mess Owner Dashboard */}
        <Route
          path="/dashboard/messowner"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <MessOwnerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Laundry Owner Dashboard */}
        <Route
          path="/dashboard/laundry"
          element={
            <RoleProtectedRoute allowedRoles={["laundry"]}>
              <LaundryDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Add PG listing (PG Owner Only) */}
        <Route
          path="/dashboard/add-listing"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <AddListing />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Add Mess listing (Mess Owner Only) */}
        <Route
          path="/dashboard/add-mess"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <AddMessListing />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Fallback */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
