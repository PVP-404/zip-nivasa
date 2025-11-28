// src/pages/dashboard/AddMessListing.jsx

import { addMess } from "../../services/messService";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

// --- 1. Reusable Input Field Component ---
const InputField = ({ label, id, name, type = "text", value, onChange, placeholder, error, textarea, required }) => (
  <div>
    <label htmlFor={id} className="block mb-2 font-semibold text-gray-700">{label}</label>
    {textarea ? (
      <textarea
        id={id} name={name} rows="4" value={value} onChange={onChange} placeholder={placeholder} required={required}
        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 resize-none transition duration-200 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
      />
    ) : (
      <input
        type={type} id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// --- 2. Main Component ---
const initialDailyMenu = {
  monday: { lunch: "", dinner: "" }, tuesday: { lunch: "", dinner: "" },
  wednesday: { lunch: "", dinner: "" }, thursday: { lunch: "", dinner: "" },
  friday: { lunch: "", dinner: "" }, saturday: { lunch: "", dinner: "" },
  sunday: { lunch: "", dinner: "" },
};

const initialFormData = {
  messName: "", location: "", address: "", contactNumber: "", description: "",
  images: [], subscriptions: [{ planName: "Monthly", price: "" }],
  dailyMenu: initialDailyMenu,
};

const AddMessListing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Unified Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    setErrors(prev => ({ ...prev, images: "" }));
  };

  // Subscription Handlers
  const updateSubscriptions = (newSubscriptions) => {
    setFormData(prev => ({ ...prev, subscriptions: newSubscriptions }));
  };
  
  const handleSubscriptionChange = (index, e) => {
    const { name, value } = e.target;
    const newSubscriptions = [...formData.subscriptions];
    newSubscriptions[index][name] = value;
    updateSubscriptions(newSubscriptions);
  };

  const addSubscriptionField = () => {
    updateSubscriptions([...formData.subscriptions, { planName: "", price: "" }]);
  };

  const removeSubscriptionField = (index) => {
    updateSubscriptions(formData.subscriptions.filter((_, i) => i !== index));
  };

  const handleDailyMenuChange = (day, meal, e) => {
    setFormData(prev => ({
      ...prev,
      dailyMenu: {
        ...prev.dailyMenu,
        [day]: { ...prev.dailyMenu[day], [meal]: e.target.value },
      },
    }));
  };

  const validateStep = (step) => {
    let currentErrors = {};
    const { messName, location, address, contactNumber, description, images, subscriptions } = formData;

    if (step === 1) {
      if (!messName) currentErrors.messName = "Mess name is required.";
      if (!location) currentErrors.location = "Location (city/area) is required.";
      if (!address) currentErrors.address = "Full address is required.";
      if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
        currentErrors.contactNumber = "A valid 10-digit contact number is required.";
      }
      if (!description) currentErrors.description = "A description is required.";
    }
    
    if (step === 2) {
      if (images.length === 0) currentErrors.images = "Please upload at least one image.";
      subscriptions.forEach((sub, index) => {
        if (!sub.planName) currentErrors[`planName${index}`] = "Plan name is required.";
        if (!sub.price || sub.price <= 0) currentErrors[`price${index}`] = "Price must be a positive number.";
      });
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleNavigation = (direction) => () => {
    const newStep = currentStep + direction;
    if (direction === 1 && !validateStep(currentStep)) return;
    if (newStep >= 1 && newStep <= 2) {
      setCurrentStep(newStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      const ownerId = localStorage.getItem("ownerId");
      if (!ownerId) return alert("Owner ID missing. Please log in again.");

      // Map frontend data to backend expected format
      const messData = {
        messOwnerId: ownerId,
        title: formData.messName,
        description: formData.description,
        location: formData.location,
        price: formData.subscriptions.length > 0 ? parseInt(formData.subscriptions[0].price) : 0,
        type: "Veg", // Assuming default type, modify as needed
        menu: Object.values(formData.dailyMenu).flatMap(meal => [meal.lunch, meal.dinner]).filter(Boolean),
        contact: formData.contactNumber,
        specialToday: {
          lunch: formData.dailyMenu.monday.lunch || "",
          dinner: formData.dailyMenu.monday.dinner || "",
        },
      };

      const response = await addMess(messData);

      if (response.success) {
        alert("Mess listing saved successfully! 🎉");
        setFormData(initialFormData); // Reset form
        setCurrentStep(1);
      } else {
        alert("Failed to save mess.");
      }
    } catch (err) {
      console.error("❌ Error saving mess:", err);
      alert("Server error. Check console for details.");
    }
  };


  // --- Step Renderer Functions ---

  const renderStep1 = () => (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">1. Basic Details</h2>
      <InputField label="Mess Name" id="messName" name="messName" value={formData.messName} onChange={handleInputChange} placeholder="e.g., Mahadev Tiffin Service" error={errors.messName} required />
      
      <div className="grid md:grid-cols-2 gap-6">
        <InputField label="Location (City/Area)" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Pimpri-Chinchwad" error={errors.location} required />
        <InputField label="Contact Number" id="contactNumber" name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g., 9876543210" error={errors.contactNumber} required />
      </div>
      
      <InputField label="Full Address" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Landmark, Pin Code" error={errors.address} required />
      <InputField label="Description" id="description" name="description" textarea value={formData.description} onChange={handleInputChange} placeholder="Describe your mess, specialities, delivery radius, etc." error={errors.description} required />
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">2. Plans & Media</h2>
      
      {/* Image Upload */}
      <div>
        <label htmlFor="images" className="block mb-2 font-semibold text-gray-700">Upload Images</label>
        <input type="file" id="images" accept="image/*" multiple onChange={handleImageChange}
          className={`w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200 ${errors.images ? "border-red-500" : ""}`}
        />
        <p className="mt-2 text-sm text-gray-500">Add high-quality photos of your food and kitchen.</p>
        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((file, index) => (
              <img key={index} src={URL.createObjectURL(file)} alt={`upload preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
            ))}
          </div>
        )}
      </div>

      {/* Subscription Plans */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">Subscription Plans</label>
        {formData.subscriptions.map((sub, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <div className="flex-1">
              <input type="text" name="planName" value={sub.planName} onChange={(e) => handleSubscriptionChange(index, e)}
                placeholder="e.g., Monthly Plan, Lunch Only" required
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors[`planName${index}`] ? "border-red-500" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors[`planName${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`planName${index}`]}</p>}
            </div>
            <div className="flex-1">
              <input type="number" name="price" value={sub.price} onChange={(e) => handleSubscriptionChange(index, e)}
                placeholder="Price (₹)" required
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors[`price${index}`] ? "border-red-500" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors[`price${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`price${index}`]}</p>}
            </div>
            {formData.subscriptions.length > 1 && (
              <button type="button" onClick={() => removeSubscriptionField(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSubscriptionField} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-semibold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg> Add another plan
        </button>
      </div>

      {/* Weekly Menu Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Menu</h3>
        <p className="text-gray-600 text-sm mb-4">Provide a sample weekly menu to help customers decide.</p>
        {Object.keys(formData.dailyMenu).map((day) => (
          <div key={day} className="grid md:grid-cols-3 items-center gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold capitalize text-gray-700">{day}</h4>
            <input type="text" name="lunch" value={formData.dailyMenu[day].lunch} onChange={(e) => handleDailyMenuChange(day, "lunch", e)}
              placeholder="Lunch menu" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input type="text" name="dinner" value={formData.dailyMenu[day].dinner} onChange={(e) => handleDailyMenuChange(day, "dinner", e)}
              placeholder="Dinner menu" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      default: return null;
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole="mess_owner" isLoggedIn={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold mb-2 text-gray-800">
            Add New Mess Listing
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-gray-600 mb-6">
            Provide detailed information to attract the right customers for your mess.
          </motion.p>
          <div className="w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleNavigation(-1)}
                    className="px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  > ← Back </motion.button>
                )}
                {currentStep < 2 ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleNavigation(1)}
                    className={`ml-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  > Next Step → </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="ml-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  > Submit Listing </motion.button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddMessListing;  