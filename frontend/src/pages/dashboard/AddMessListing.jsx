import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import LocationAutosuggest from "../../components/LocationAutosuggest";
import { FaRupeeSign } from "react-icons/fa";
import PinDropMap from "../../components/maps/PinDropMap";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UploadIcon = () => (
  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
    </path>
  </svg>
);

const steps = [
  { id: 1, name: "Mess Details & Location" },
  { id: 2, name: "Pricing & Weekly Menu" },
  { id: 3, name: "Description & Photos" },
];

const initialDailyMenu = {
  monday: { lunch: "", dinner: "" },
  tuesday: { lunch: "", dinner: "" },
  wednesday: { lunch: "", dinner: "" },
  thursday: { lunch: "", dinner: "" },
  friday: { lunch: "", dinner: "" },
  saturday: { lunch: "", dinner: "" },
  sunday: { lunch: "", dinner: "" },
};

const AddMessListing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPinMap, setShowPinMap] = useState(false);
  const [manualCoords, setManualCoords] = useState(null);


  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);

  const [formData, setFormData] = useState({
    messName: "",
    messType: "",
    streetAddress: "",
    pincode: "",
    district: "",
    state: "",
    contactNumber: "",
    basePrice: "",
    description: "",
    subscriptions: [{ planName: "Monthly", price: "" }],
    dailyMenu: initialDailyMenu,
    images: [],
  });

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.messName.trim() !== "" &&
          formData.messType !== "" &&
          formData.streetAddress.trim() !== "" &&
          /^\d{6}$/.test(formData.pincode) &&
          formData.district.trim() !== "" &&
          formData.state.trim() !== "" &&
          /^\d{10}$/.test(formData.contactNumber)
        );
      case 2:
        return (
          formData.basePrice > 0 &&
          formData.subscriptions.length > 0 &&
          formData.subscriptions.every(
            (s) => s.planName.trim() !== "" && Number(s.price) > 0
          )
        );
      case 3:
        return (
          formData.description.trim() !== "" &&
          formData.images.length > 0
        );
      default:
        return false;
    }
  }, [currentStep, formData]);

  // ---------- Generic Handlers ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData((prev) => ({ ...prev, pincode }));
    setPincodeError(null);

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      await performPincodeLookup(pincode);
    } else {
      setFormData((prev) => ({ ...prev, district: "", state: "" }));
    }
  };

  const performPincodeLookup = async (pincode) => {
    try {
      setPincodeLookupLoading(true);
      setPincodeError(null);

      const res = await fetch(`${API_BASE}/api/utilities/pincode/${pincode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Pincode lookup failed");
      }

      if (data.district && data.state) {
        setFormData((prev) => ({
          ...prev,
          district: data.district,
          state: data.state,
        }));
      } else {
        setPincodeError("Invalid Pincode or no location data found.");
        setFormData((prev) => ({ ...prev, district: "", state: "" }));
      }
    } catch (err) {
      console.error("Pincode lookup error:", err);
      setPincodeError(err.message || "Failed to lookup Pincode.");
      setFormData((prev) => ({ ...prev, district: "", state: "" }));
    } finally {
      setPincodeLookupLoading(false);
    }
  };

  const handleDailyMenuChange = (day, meal, e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dailyMenu: {
        ...prev.dailyMenu,
        [day]: { ...prev.dailyMenu[day], [meal]: value },
      },
    }));
  };

  const handleSubscriptionChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const subs = [...prev.subscriptions];
      subs[index][name] = value;
      return { ...prev, subscriptions: subs };
    });
  };

  const addSubscription = () => {
    setFormData((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, { planName: "", price: "" }],
    }));
  };

  const removeSubscription = (index) => {
    setFormData((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleNext = () => {
    if (!isStepValid) return;
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStepValid || loading) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again.");
        setLoading(false);
        return;
      }

      const fd = new FormData();

      fd.append("title", formData.messName);
      fd.append("description", formData.description);
      fd.append("streetAddress", formData.streetAddress);
      fd.append("pincode", formData.pincode);
      fd.append("district", formData.district);
      fd.append("state", formData.state);
      fd.append("price", formData.basePrice);
      fd.append("type", formData.messType || "Veg");
      fd.append("contact", formData.contactNumber);

      const flatMenu = Object.values(formData.dailyMenu)
        .flatMap((day) => [day.lunch, day.dinner])
        .filter(Boolean);
      fd.append("menu", JSON.stringify(flatMenu));

      fd.append("subscriptions", JSON.stringify(formData.subscriptions));

      fd.append(
        "specialToday",
        JSON.stringify({
          lunch: formData.dailyMenu.monday.lunch || "",
          dinner: formData.dailyMenu.monday.dinner || "",
        })
      );

      //  ADD: manual pin-drop coords if available
      if (manualCoords) {
        fd.append("latitude", manualCoords.lat);
        fd.append("longitude", manualCoords.lng);
      }

      formData.images.forEach((img) => fd.append("images", img));

      const res = await fetch(`${API_BASE}/api/mess/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      //  ADD: backend requests pin drop
      if (data.requirePinDrop) {
        setShowPinMap(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save mess listing");
      }

      alert("Mess listing saved successfully!");

      setFormData({
        messName: "",
        messType: "",
        streetAddress: "",
        pincode: "",
        district: "",
        state: "",
        contactNumber: "",
        basePrice: "",
        description: "",
        subscriptions: [{ planName: "Monthly", price: "" }],
        dailyMenu: initialDailyMenu,
        images: [],
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Error saving mess:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // ---------- Step Views ----------
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="border-b pb-4 mb-4 border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-800">Mess Details & Location</h2>
              <p className="text-sm text-emerald-500">
                Add accurate details so hungry students can discover you easily.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  Mess Name <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  name="messName"
                  value={formData.messName}
                  onChange={handleInputChange}
                  placeholder="e.g., Mahadev Tiffin Service"
                  className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  Mess Type <span className="text-emerald-500">*</span>
                </label>
                <select
                  name="messType"
                  value={formData.messType}
                  onChange={handleInputChange}
                  className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold text-emerald-800 pt-4 border-t mt-4 border-emerald-100">
              Location
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  Pincode <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    placeholder="e.g., 411033"
                    className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                    required
                  />
                  {pincodeLookupLoading && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <SpinnerIcon />
                    </div>
                  )}
                </div>
                {pincodeError && (
                  <p className="text-emerald-500 text-xs mt-1 bg-emerald-50/60 p-2 rounded-lg">
                    {pincodeError}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  District / City <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g., Pimpri-Chinchwad"
                  className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/80 disabled:bg-emerald-50 shadow-sm"
                  required
                  disabled={formData.pincode.length === 6 && !pincodeError}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  State <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., Maharashtra"
                  className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/80 disabled:bg-emerald-50 shadow-sm"
                  required
                  disabled={formData.pincode.length === 6 && !pincodeError}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-emerald-700">
                Street Address (Building, Lane, Landmark){" "}
                <span className="text-emerald-500">*</span>
              </label>
              <LocationAutosuggest
                value={formData.streetAddress}
                onChange={(address) =>
                  setFormData((prev) => ({ ...prev, streetAddress: address }))
                }
              />
              <p className="text-xs text-emerald-500 mt-1 bg-emerald-50/60 p-2 rounded-lg">
                This exact address is used to compute latitude/longitude and Mappls eLoc.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-emerald-700">
                Contact Number <span className="text-emerald-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                maxLength={10}
                placeholder="e.g., 9876543210"
                className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                required
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="border-b pb-4 mb-4 border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-800">Pricing & Weekly Menu</h2>
              <p className="text-sm text-emerald-500">
                Define your base plan and show a sample weekly menu.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  Base Monthly Price (₹) <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-3 text-emerald-500 w-4 h-4" />
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 3500"
                    className="w-full pl-10 border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-emerald-700">
                  Subscription Plans <span className="text-emerald-500">*</span>
                </label>
                {formData.subscriptions.map((sub, idx) => (
                  <div key={idx} className="flex gap-3 mb-2">
                    <input
                      type="text"
                      name="planName"
                      value={sub.planName}
                      onChange={(e) => handleSubscriptionChange(idx, e)}
                      placeholder="Plan name (e.g., Lunch Only)"
                      className="flex-1 border border-emerald-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    />
                    <input
                      type="number"
                      name="price"
                      value={sub.price}
                      onChange={(e) => handleSubscriptionChange(idx, e)}
                      placeholder="Price"
                      className="w-32 border border-emerald-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    />
                    {formData.subscriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubscription(idx)}
                        className="text-red-500 text-xs font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubscription}
                  className="mt-2 text-emerald-600 text-sm font-semibold hover:text-emerald-800"
                >
                  + Add another plan
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-emerald-800 mb-3">Weekly Menu</h3>
              <p className="text-xs text-emerald-500 mb-4 bg-emerald-50/70 p-2 rounded-lg">
                This is for display only – we will still store a simple menu list & todayʼs special.
              </p>
              {Object.keys(formData.dailyMenu).map((day) => (
                <div
                  key={day}
                  className="grid md:grid-cols-3 items-center gap-4 mb-3 p-4 border rounded-lg bg-emerald-50/40"
                >
                  <h4 className="font-semibold capitalize text-emerald-800">
                    {day}
                  </h4>
                  <input
                    type="text"
                    name="lunch"
                    value={formData.dailyMenu[day].lunch}
                    onChange={(e) => handleDailyMenuChange(day, "lunch", e)}
                    placeholder="Lunch items"
                    className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <input
                    type="text"
                    name="dinner"
                    value={formData.dailyMenu[day].dinner}
                    onChange={(e) => handleDailyMenuChange(day, "dinner", e)}
                    placeholder="Dinner items"
                    className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="border-b pb-4 mb-4 border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-800">Description & Photos</h2>
              <p className="text-sm text-emerald-500">
                Show students what they’ll actually get on the plate.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-emerald-700">
                Description <span className="text-emerald-500">*</span>
              </label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe food quality, timings, homely vibe, hygiene and any rules..."
                className="w-full border border-emerald-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm resize-none"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-emerald-700">
                Upload Images <span className="text-emerald-500">*</span>
              </label>
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-emerald-50/40 hover:bg-emerald-50 transition-colors relative group">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center text-emerald-500 pointer-events-none">
                  <UploadIcon />
                  <p className="mt-2 text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-emerald-400">
                    JPG, PNG, GIF up to 5MB each
                  </p>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {formData.images.map((file, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden shadow-sm border border-emerald-200 bg-white"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-emerald-500 hover:bg-emerald-50 shadow-xs"
                    >
                      <XCircleIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-mint-50 font-sans">
      <Header userRole="mess_owner" isLoggedIn={true} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-800">Add New Mess Listing</h1>
            <p className="text-emerald-500 mt-1">
              Help students and working professionals discover your homely mess on Zip Nivasa.
            </p>
          </motion.div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
            {/* Progress bar */}
            <div className="bg-emerald-50/90 px-8 py-6 border-b border-emerald-100">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-100 rounded-full"></div>
                <div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>

                {steps.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all ${currentStep >= step.id
                        ? "bg-emerald-500 border-emerald-300 text-white shadow-lg"
                        : "bg-emerald-100 border-emerald-200 text-emerald-600"
                        }`}
                    >
                      {step.id}
                    </div>
                    <span
                      className={`mt-2 text-[10px] font-semibold uppercase tracking-wide text-center ${currentStep >= step.id ? "text-emerald-700" : "text-emerald-400"
                        }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-emerald-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md flex items-center gap-2 ${isStepValid
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
                      : "bg-emerald-200 cursor-not-allowed border border-emerald-300"
                      }`}
                  >
                    Next Step
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isStepValid || loading}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md flex items-center gap-2 ${isStepValid && !loading
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
                      : "bg-emerald-200 cursor-not-allowed border border-emerald-300"
                      }`}
                  >
                    {loading ? (
                      <>
                        <SpinnerIcon />
                        Submitting...
                      </>
                    ) : (
                      "Submit Listing"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>

      {showPinMap && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-xl">
            <h3 className="font-bold text-emerald-700 mb-2">
              Confirm Exact Location
            </h3>

            <PinDropMap
              onConfirm={(pos) => {
                setManualCoords(pos);
                setShowPinMap(false);
                setTimeout(() => handleSubmit(new Event("submit")), 0);
              }}
            />
          </div>
        </div>
      )}


      <Footer />
    </div>
  );
};

export default AddMessListing;
