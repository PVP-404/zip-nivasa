import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { requestFCMToken, registerTokenWithBackend } from "../services/fcm";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { initializeGoogleLogin, renderGoogleButton, handleGoogleResponse } from "../services/googleAuth";
import { useEffect } from "react";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeGoogleLogin(async (response) => {
      try {
        const user = await handleGoogleResponse(response);

        if (!user.profileCompleted) {
          return navigate("/complete-profile");
        }

        navigate("/dashboard/student");

      } catch {
        alert("Google login failed");
      }
    });

    renderGoogleButton("google-login-btn");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      localStorage.clear();

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.name);
      localStorage.setItem("userId", user.id);
      localStorage.removeItem("fcmToken");

      try {
        const browserToken = await requestFCMToken();

        if (browserToken) {
          localStorage.setItem("fcmToken", browserToken);
          await registerTokenWithBackend(browserToken);
          console.log("FCM token registered:", browserToken);
        }
      } catch (fcmErr) {
        console.warn("FCM setup failed:", fcmErr);
      }

      switch (user.role) {
        case "pgowner":
          navigate("/dashboard/pgowner");
          break;
        case "messowner":
          navigate("/dashboard/messowner");
          break;
        case "laundry":
          navigate("/dashboard/laundry");
          break;
        case "tenant":
        case "student":
          navigate("/dashboard/student");
          break;

        default:
          throw new Error("Unknown user role detected.");
      }

    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <motion.div
        className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue to your Zip Nivasa dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div className="relative">
                <label htmlFor="password-address" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-emerald-600 py-3 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div id="google-login-btn" className="flex justify-center"></div>

          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
      <div className="hidden lg:block relative">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/login-bg.jpg"
          alt="A modern and clean living space"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
      </div>
    </div>
  );
};

export default Login;
