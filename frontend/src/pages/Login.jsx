// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const roleImages = {
  student: 'https://images.pexels.com/photos/3807750/pexels-photo-3807750.jpeg',
  pgowner: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg',
  messowner: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg',
  laundry: 'https://images.pexels.com/photos/3616760/pexels-photo-3616760.jpeg',
  service: 'https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg',
};

const loginBanner = "https://cdn-icons-png.flaticon.com/512/5087/5087579.png";

const Login = () => {
  const query = new URLSearchParams(useLocation().search);
  const roleParam = query.get("role") || "student";

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // handle non-JSON or 500 gracefully
      let data;
      try {
        data = await res.json();
      } catch {
        alert("Server error");
        return;
      }

      if (!data?.success) {
        alert(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      switch (data.user.role) {
        case "tenant":
          navigate("/dashboard/student");
          break;
        case "pgowner":
          navigate("/dashboard/pgowner");
          break;
        case "messowner":
          navigate("/dashboard/messowner");
          break;
        case "laundry":
          navigate("/dashboard/laundry");
          break;
        case "service":
          navigate("/dashboard/service");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50">
      {/* LEFT IMAGE */}
      <div className="hidden md:block md:w-1/2 h-screen relative">
        <img
          src={roleImages[roleParam.toLowerCase()] || roleImages.student}
          className="w-full h-full object-cover rounded-l-3xl"
          alt="Role"
        />
        <div className="absolute inset-0 bg-sky-700 bg-opacity-30 flex items-center justify-center">
          <img src={loginBanner} className="w-40 h-40 md:w-56 md:h-56" alt="Banner"/>
        </div>
      </div>

      {/* LOGIN FORM */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white p-10 rounded-3xl shadow-xl border w-full max-w-md">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">Login</h2>
          <p className="text-gray-500 text-center mb-8">Enter your details to continue</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 border rounded-lg"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 border rounded-lg"
                placeholder="********"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg shadow-md"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            New to Zip-Nivasa?{" "}
            <Link className="text-sky-600" to={`/register?role=${roleParam}`}>
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
