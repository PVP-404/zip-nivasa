import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { requestFCMToken, registerTokenWithBackend } from "../services/fcm";
import { motion } from "framer-motion";

const roleImages = {
  student: "https://images.pexels.com/photos/3807750/pexels-photo-3807750.jpeg",
  pgowner: "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",
  messowner: "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  laundry: "https://images.pexels.com/photos/3616760/pexels-photo-3616760.jpeg",
  service: "https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg",
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
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.name);
      localStorage.setItem("email", data.user.email);

      if (data.user.role === "messowner" || data.user.role === "pgowner") {
        localStorage.setItem("ownerId", data.user.id);
      }

      console.log("LOGIN RESPONSE:", data);

      const browserToken = await requestFCMToken();

      if (browserToken) {
        localStorage.setItem("fcmToken", browserToken);
       
        await registerTokenWithBackend(browserToken);
      }

      switch (data.user.role) {
        case "tenant":
        case "student":
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
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-emerald-50/90 via-emerald-50 to-mint-50/90">
      <div className="hidden md:block md:w-1/2 h-screen relative">
        <img
          src={roleImages[roleParam.toLowerCase()] || roleImages.student}
          className="w-full h-full object-cover rounded-l-3xl"
          alt="Role"
        />
        <div className="absolute inset-0 bg-emerald-600 bg-opacity-30 flex items-center justify-center">
          <img src={loginBanner} className="w-40 h-40 md:w-56 md:h-56" alt="Banner" />
        </div>
      </div>

      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md">
          <h2 className="text-4xl font-bold text-emerald-800 text-center mb-2">Login</h2>
          <p className="text-emerald-500 text-center mb-8">
            Enter your details to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-emerald-600 mb-1 font-semibold">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-600 mb-1 font-semibold">Password</label>
              <input
                type="password"
                className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Login
            </button>
          </form>

          <p className="text-center text-emerald-500 mt-8">
            New to Zip-Nivasa?{" "}
            <Link className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors" to={`/register?role=${roleParam}`}>
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
