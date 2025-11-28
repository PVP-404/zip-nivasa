// src/pages/dashboard/AddListing.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const steps = [
  { id: 1, name: "Property Details", icon: "🏠" },
  { id: 2, name: "Pricing & Amenities", icon: "💰" },
  { id: 3, name: "Description & Media", icon: "🖼️" },
];

const AddListing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    location: "",
    address: "",
    monthlyRent: "",
    deposit: "",
    occupancyType: "",
    amenities: [],
    description: "",
    images: [], // Changed to an array for better handling
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the error for the field once the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const newAmenities = checked
        ? [...prevData.amenities, value]
        : prevData.amenities.filter((amenity) => amenity !== value);
      return { ...prevData, amenities: newAmenities };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
    if (errors.images) {
      setErrors({ ...errors, images: "" });
    }
  };

  const validateStep = (step) => {
    let currentErrors = {};
    if (step === 1) {
      if (!formData.title) currentErrors.title = "A listing title is required.";
      if (!formData.propertyType) currentErrors.propertyType = "Please select a property type.";
      if (!formData.location) currentErrors.location = "Location is required.";
      if (!formData.address) currentErrors.address = "Full address is required.";
    }
    if (step === 2) {
      if (!formData.monthlyRent || formData.monthlyRent <= 0) currentErrors.monthlyRent = "Monthly rent must be a positive number.";
      if (!formData.deposit || formData.deposit < 0) currentErrors.deposit = "Security deposit is required and cannot be negative.";
      if (!formData.occupancyType) currentErrors.occupancyType = "Please select an occupancy type.";
      if (formData.amenities.length === 0) currentErrors.amenities = "Please select at least one amenity.";
    }
    if (step === 3) {
      if (!formData.description) currentErrors.description = "A detailed description is required.";
      if (formData.images.length === 0) currentErrors.images = "Please upload at least one image.";
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateStep(currentStep)) {
    try {
      // Create FormData to handle file uploads
      const submitData = new FormData();
      
      // Append all text fields
      submitData.append('title', formData.title);
      submitData.append('propertyType', formData.propertyType);
      submitData.append('location', formData.location);
      submitData.append('address', formData.address);
      submitData.append('monthlyRent', formData.monthlyRent);
      submitData.append('deposit', formData.deposit);
      submitData.append('occupancyType', formData.occupancyType);
      submitData.append('description', formData.description);
      
      // Append amenities as JSON string
      submitData.append('amenities', JSON.stringify(formData.amenities));
      
      // Append image files
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });

      // Make API call to backend
      const response = await fetch("http://localhost:5000/api/pgs", {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: submitData,
});


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit listing');
      }

      const result = await response.json();
      console.log('Listing created:', result);
      
      alert('Listing submitted successfully! Thank you for adding your property to Zip Nivasa.');
      
      // Reset form
      setFormData({
        title: "",
        propertyType: "",
        location: "",
        address: "",
        monthlyRent: "",
        deposit: "",
        occupancyType: "",
        amenities: [],
        description: "",
        images: [],
      });
      setCurrentStep(1);
      
      // Optional: Redirect to listings page
      // window.location.href = '/dashboard/listings';
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(`Failed to submit listing: ${error.message}`);
    }
  }
};

  const occupancyOptions = [
    { value: "single", label: "Single" },
    { value: "double", label: "Double" },
    { value: "triple", label: "Triple" },
    { value: "four_plus", label: "4+ Occupancy" },
  ];

  const amenityOptions = [
    "Wi-Fi", "Laundry", "Parking", "Attached Bathroom", "AC", "TV",
    "Locker/Wardrobe", "Mess/Food Service", "Security", "Housekeeping", "Power Backup", "Gym"
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">1. Property Details</h2>
            <div>
              <label htmlFor="title" className="block mb-2 font-semibold text-gray-700">Listing Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Cozy PG Room near University"
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="propertyType" className="block mb-2 font-semibold text-gray-700">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.propertyType ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="hostel">Hostel</option>
                  <option value="room">Independent Room</option>
                  <option value="flat">Shared Flat</option>
                </select>
                {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block mb-2 font-semibold text-gray-700">Location (City/Area)</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Pimpri-Chinchwad"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block mb-2 font-semibold text-gray-700">Full Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street, Landmark, Pin Code"
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                required
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">2. Pricing & Amenities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="monthlyRent" className="block mb-2 font-semibold text-gray-700">Monthly Rent (₹)</label>
                <input
                  type="number"
                  id="monthlyRent"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  placeholder="e.g., 5500"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.monthlyRent ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.monthlyRent && <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>}
              </div>

              <div>
                <label htmlFor="deposit" className="block mb-2 font-semibold text-gray-700">Security Deposit (₹)</label>
                <input
                  type="number"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  placeholder="e.g., 11000"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-200 ${errors.deposit ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">Occupancy Type</label>
              <div className="flex flex-wrap gap-4">
                {occupancyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center cursor-pointer px-4 py-3 rounded-lg border ${
                      formData.occupancyType === option.value ? "bg-blue-100 border-blue-500 text-blue-800" : "border-gray-300 text-gray-700"
                    } transition duration-200 hover:bg-blue-50`}
                  >
                    <input
                      type="radio"
                      name="occupancyType"
                      value={option.value}
                      checked={formData.occupancyType === option.value}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500 hidden" // Hide default radio button
                      required
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.occupancyType && <p className="text-red-500 text-sm mt-1">{errors.occupancyType}</p>}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {amenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center cursor-pointer px-4 py-3 rounded-lg border ${
                      formData.amenities.includes(amenity) ? "bg-green-100 border-green-500 text-green-800" : "border-gray-300 text-gray-700"
                    } transition duration-200 hover:bg-green-50`}
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleCheckboxChange}
                      className="text-green-600 focus:ring-green-500 hidden" // Hide default checkbox
                    />
                    <span className="font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
              {errors.amenities && <p className="text-red-500 text-sm mt-1">{errors.amenities}</p>}
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
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">3. Description & Media</h2>
            <div>
              <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property, nearby landmarks, rules, etc."
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 resize-none transition duration-200 ${errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                required
              ></textarea>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="images" className="block mb-2 font-semibold text-gray-700">Upload Images</label>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200 ${errors.images ? "border-red-500" : ""}`}
              />
              <p className="mt-2 text-sm text-gray-500">Add high-quality photos to make your listing stand out.</p>
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`upload preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
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
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole="owner" isLoggedIn={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-2 text-gray-800"
          >
            Add New Listing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-gray-600 mb-6"
          >
            List your accommodation on Zip Nivasa and connect with students and migrants.
          </motion.p>
          <div className="w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              {steps.map((step) => (
                <div key={step.id} className="relative flex items-center flex-col">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white relative z-10 ${
                      currentStep === step.id
                        ? "bg-blue-600"
                        : currentStep > step.id
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="mt-2 text-sm text-center font-medium">{step.name}</span>
                  {step.id < steps.length && (
                    <div className="absolute top-5 left-1/2 -ml-2 w-full h-1 bg-gray-200 z-0">
                      <motion.div
                        className="h-1 bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: currentStep > step.id ? "100%" : 0 }}
                        transition={{ duration: 0.5 }}
                      ></motion.div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    ← Back
                  </motion.button>
                )}
                {currentStep < steps.length ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNext}
                    className={`ml-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    Next Step →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="ml-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Submit Listing
                  </motion.button>
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

export default AddListing;