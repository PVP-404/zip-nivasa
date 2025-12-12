import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, setupRecaptcha, signInWithPhoneNumber } from "../../config/firebase";
import { requestFCMToken, registerTokenWithBackend } from "../../services/fcm";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Phone, KeyRound } from "lucide-react";

const PhoneLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  const sendOTP = async () => {
    setError("");

    if (!phone || phone.length !== 10) {
      return setError("Enter valid 10-digit phone number.");
    }

    try {
      setLoading(true);
      const fullPhone = "+91" + phone;

      const recaptcha = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptcha);

      window.confirmationResult = confirmation;
      setStep("otp");
      setResendCooldown(30); // Start 30-second cooldown
    } catch (err) {
      console.error("OTP Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown === 0) sendOTP();
  };

  const verifyOTP = async () => {
    setError("");

    if (!otp || otp.length < 6) {
      return setError("Enter valid 6-digit OTP.");
    }

    try {
      setLoading(true);

      const result = await window.confirmationResult.confirm(otp);
      const firebaseToken = await result.user.getIdToken();
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      // Backend verification
      const res = await axios.post(`${API}/api/auth/phone-login`, {
        idToken: firebaseToken,
      });

      const { token, user } = res.data;

      // Save session
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.name);

      // FCM token
      const browserToken = await requestFCMToken();
      if (browserToken) {
        localStorage.setItem("fcmToken", browserToken);
        await registerTokenWithBackend(browserToken);
      }

      // Redirect by role
      if (!user.profileCompleted) {
        return navigate("/complete-profile");
      }

      switch (user.role) {
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

        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-25 to-mint-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-emerald-100/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Phone Verification
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {step === "phone"
                ? "Enter your phone number to receive a verification code."
                : `We've sent a code to +91 ${phone}.`}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {step === "phone" ? (
                <div className="space-y-6">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                      +91
                    </span>
                    <input
                      className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="10-digit number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  <button
                    onClick={sendOTP}
                    disabled={loading || phone.length !== 10}
                    className="group relative flex w-full justify-center rounded-lg border border-transparent bg-emerald-600 py-3 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      className="w-full text-center tracking-[0.5em] font-semibold py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="------"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={verifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="group relative flex w-full justify-center rounded-lg border border-transparent bg-emerald-600 py-3 px-4 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                  </button>
                  <div className="text-center text-sm">
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="font-medium text-emerald-600 hover:text-emerald-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div id="recaptcha-container" className="flex justify-center mt-4"></div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneLogin;
