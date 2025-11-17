// ✅ frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import AllMesses from "./pages/mess/AllMesses";

// Dashboards
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import PGOwnerDashboard from "./pages/dashboard/PGOwnerDashboard";
import LaundryDashboard from "./pages/dashboard/LaundryDashboard";
import MessOwnerDashboard from "./pages/dashboard/MessOwnerDashboard";

// PG Pages
import AllPGs from "./pages/pgs/AllPGs";
import PGDetails from "./pages/pgs/PGDetails";
import SearchPGResults from "./pages/pgs/SearchPGResults";



// Tenant Pages
import MyBookings from "./pages/tenant/MyBookings";
import Payments from "./pages/tenant/Payments";
import Complaints from "./pages/tenant/Complaints";
import Profile from "./pages/profile/Profile";

//mess pages
// Mess Details Page
import MessDetails from "./pages/mess/MessDetails";


// Other Pages
import AddListing from "./pages/dashboard/AddListing";
import AddMessListing from "./pages/dashboard/AddMessListing";

// Auth Guards
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// ✅ Chat Pages
import ChatPageWrapper from "./pages/chat/ChatPageWrapper";
import ChatList from "./pages/chat/ChatList";      // ✅ FIXED IMPORT
import Inbox from "./pages/chat/Inbox";            // ✅ KEEP if required

function App() {
  return (
    <Router>
      <Routes>

        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />

        {/* ✅ PG LISTING - Public */}
        <Route path="/pgs/all" element={<AllPGs />} />
        <Route path="/services/pg/:id" element={<PGDetails />} />

        {/* ✅ Chat Route */}
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatPageWrapper />
            </ProtectedRoute>
          }
        />

        {/* ✅ Chat List for all roles */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        {/* ✅ Inbox (Optional — keep if needed) */}
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />

        {/* ✅ Student Dashboard */}
        <Route
          path="/dashboard/student"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <StudentDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Student Pages */}
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
          path="/tenant/profile"
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
        <Route
          path="/mess/:id"
          element={
            <ProtectedRoute>
              <MessDetails />
            </ProtectedRoute>
          }
        />


        {/* ✅ Laundry Dashboard */}
        <Route
          path="/dashboard/laundry"
          element={
            <RoleProtectedRoute allowedRoles={["laundry"]}>
              <LaundryDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ Owner Add Listing */}
        <Route
          path="/dashboard/add-listing"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <AddListing />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/add-mess"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <AddMessListing />
            </RoleProtectedRoute>
          }
        />
        <Route path="/accommodations" element={<SearchPGResults />} />

        <Route path="/messes" element={<AllMesses />} />

        {/* ✅ Fallback */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
