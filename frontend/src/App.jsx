import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";

import PGNearMe from "./pages/pgs/PGNearMe";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import AllMesses from "./pages/mess/AllMesses";
import Notifications from "./pages/Notifications";

import StudentDashboard from "./pages/dashboard/StudentDashboard";
import PGOwnerDashboard from "./pages/dashboard/PGOwnerDashboard";
import LaundryDashboard from "./pages/dashboard/LaundryDashboard";
import MessOwnerDashboard from "./pages/dashboard/MessOwnerDashboard";

import AllPGs from "./pages/pgs/AllPGs";
import PGDetails from "./pages/pgs/PGDetails";
import SearchPGResults from "./pages/pgs/SearchPGResults";

import MyBookings from "./pages/tenant/MyBookings";
import Payments from "./pages/tenant/Payments";
import Complaints from "./pages/tenant/Complaints";
import Profile from "./pages/profile/Profile";

import MessDetails from "./pages/mess/MessDetails";

import AddListing from "./pages/dashboard/AddListing";
import AddMessListing from "./pages/dashboard/AddMessListing";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import ChatPageWrapper from "./pages/chat/ChatPageWrapper";
import ChatList from "./pages/chat/ChatList";
import Inbox from "./pages/chat/Inbox";

import FCMInitializer from "./features/FCMInitializer";
import NotificationToast from "./features/NotificationToast";
import { subscribeForegroundNotifications } from "./services/fcm";

import CompleteProfile from "./pages/profile/CompleteProfile";
import PhoneLogin from "./pages/auth/PhoneLogin";



function App() {
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    subscribeForegroundNotifications((newNotif) => {
      setNotif(newNotif);
    });
  }, []);

  return (
    <Router>
      <FCMInitializer />
      {notif && (
        <NotificationToast notif={notif} onClose={() => setNotif(null)} />
      )}

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />

        <Route path="/pgs/all" element={<AllPGs />} />
        <Route path="/services/pg/:id" element={<PGDetails />} />
        <Route path="/pgs/near-me" element={<PGNearMe />} />

        <Route path="/accommodations" element={<SearchPGResults />} />
        <Route path="/messes" element={<AllMesses />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/login-phone" element={<PhoneLogin />} />



        {/* PROTECTED: NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED CHAT ROUTES */}
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <ChatPageWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />

        {/* TENANT ROUTES */}
        <Route
          path="/dashboard/student"
          element={
            <RoleProtectedRoute allowedRoles={["tenant"]}>
              <StudentDashboard />
            </RoleProtectedRoute>
          }
        />

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

        {/* PG OWNER ROUTES */}
        <Route
          path="/dashboard/pgowner"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <PGOwnerDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/add-listing"
          element={
            <RoleProtectedRoute allowedRoles={["pgowner"]}>
              <AddListing />
            </RoleProtectedRoute>
          }
        />

        {/* MESS OWNER ROUTES */}
        <Route
          path="/dashboard/messowner"
          element={
            <RoleProtectedRoute allowedRoles={["messowner"]}>
              <MessOwnerDashboard />
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

        {/* MESS DETAILS */}
        <Route
          path="/mess/:id"
          element={
            <ProtectedRoute>
              <MessDetails />
            </ProtectedRoute>
          }
        />

        {/* LAUNDRY ROUTES */}
        <Route
          path="/dashboard/laundry"
          element={
            <RoleProtectedRoute allowedRoles={["laundry"]}>
              <LaundryDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<h1>404 Page Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default App;
