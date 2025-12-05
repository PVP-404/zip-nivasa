
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const CurrencyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PhotoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const UploadIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
);
const XCircleIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
);
const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const steps = [
  { id: 1, name: "Property Details", icon: <HomeIcon /> },
  { id: 2, name: "Pricing & Amenities", icon: <CurrencyIcon /> },
  { id: 3, name: "Description & Media", icon: <PhotoIcon /> },
];

const AddListing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false); 
  const [pincodeError, setPincodeError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    propertyType: "",
    streetAddress: "", 
    pincode: "",
    district: "",
    state: "",
    monthlyRent: "",
    deposit: "",
    occupancyType: "",
    amenities: [],
    customAmenities: "", 
    description: "",
    images: [],
  });

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.trim() !== "" &&
          formData.propertyType !== "" &&
          formData.streetAddress.trim() !== "" &&
          /^\d{6}$/.test(formData.pincode) &&
          formData.district.trim() !== "" &&
          formData.state.trim() !== ""
        );
      case 2:
        return (
          formData.monthlyRent > 0 &&
          formData.deposit >= 0 &&
          formData.occupancyType !== "" &&
          (formData.amenities.length > 0 || formData.customAmenities.trim() !== "")
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setFormData((prev) => ({ ...prev, pincode: pincode }));
    setPincodeError(null);

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
        performPincodeLookup(pincode);
    } else if (pincode.length !== 6) {
        setFormData((prev) => ({ ...prev, district: "", state: "" }));
    }
  };

  const performPincodeLookup = async (pincode) => {
    setPincodeLookupLoading(true);
    setPincodeError(null);

    try {

        const response = await fetch(`http://localhost:5000/api/utilities/pincode/${pincode}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Pincode lookup failed.");
        }
        
        const data = await response.json();
        
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

    } catch (error) {
        console.error("Pincode lookup error:", error);
        setPincodeError(error.message || "Failed to lookup Pincode. Try manual entry.");
        setFormData((prev) => ({ ...prev, district: "", state: "" }));
    } finally {
        setPincodeLookupLoading(false);
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
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (!isStepValid) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      submitData.append("title", formData.title);
      submitData.append("propertyType", formData.propertyType);
      
      submitData.append("streetAddress", formData.streetAddress); 
      submitData.append("pincode", formData.pincode);
      submitData.append("district", formData.district);
      submitData.append("state", formData.state);
      
      submitData.append("monthlyRent", formData.monthlyRent);
      submitData.append("deposit", formData.deposit);
      submitData.append("occupancyType", formData.occupancyType);
      submitData.append("description", formData.description);

      let finalAmenities = [...formData.amenities];
      if (formData.customAmenities.trim()) {
        const customList = formData.customAmenities
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
        finalAmenities = [...finalAmenities, ...customList];
      }
      submitData.append("amenities", JSON.stringify(finalAmenities));

      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      const response = await fetch("http://localhost:5000/api/pgs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit listing");
      }

      alert("Listing submitted successfully!");
      
      setFormData({
        title: "", propertyType: "", streetAddress: "", pincode: "", district: "", state: "",
        monthlyRent: "", deposit: "", occupancyType: "",
        amenities: [], customAmenities: "", description: "", images: [],
      });
      setCurrentStep(1);

    } catch (error) {
      console.error("Error submitting listing:", error);
      alert(`Failed to submit: ${error.message}`);
    } finally {
      setLoading(false);
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
    "Wardrobe", "Mess Service", "Security", "Power Backup", "Gym"
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
            className="space-y-6"
          >
            <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Property Details</h2>
                <p className="text-sm text-gray-500">All fields marked with <span className="text-red-500">*</span> are mandatory.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Listing Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Spacious PG near Hinjewadi IT Park"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    required
                    >
                    <option value="">Select Type</option>
                    <option value="pg">PG (Paying Guest)</option>
                    <option value="hostel">Hostel</option>
                    <option value="room">Independent Room</option>
                    <option value="flat">Shared Flat</option>
                    </select>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 pt-4 border-t mt-4">Property Location</h3>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            maxLength="6"
                            placeholder="e.g., 411057"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        {pincodeLookupLoading && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <SpinnerIcon />
                            </div>
                        )}
                    </div>
                    {pincodeError && (
                        <p className="text-red-500 text-xs mt-1">{pincodeError}</p>
                    )}
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        District (City/Area) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="e.g., Pune"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-100"
                        required
                        disabled={formData.pincode.length === 6 && !pincodeError} 
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        State <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g., Maharashtra"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-100"
                        required
                        disabled={formData.pincode.length === 6 && !pincodeError} 
                    />
                </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Full Street Address (Building, Street, Landmark) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="streetAddress" 
                value={formData.streetAddress}
                onChange={handleInputChange}
                placeholder="Flat No, Building Name, Street, Landmark"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                    This is the specific street-level address used for accurate map placement.
                 </p>
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
             <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Pricing & Amenities</h2>
                <p className="text-sm text-gray-500">Define your rates and facilities.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Monthly Rent (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    placeholder="5500"
                    className="w-full pl-8 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Security Deposit (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    placeholder="10000"
                    className="w-full pl-8 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Occupancy Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {occupancyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center justify-center cursor-pointer p-4 rounded-xl border-2 ${
                      formData.occupancyType === option.value
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 text-gray-600"
                    } transition-all duration-200`}
                  >
                    <input
                      type="radio"
                      name="occupancyType"
                      value={option.value}
                      checked={formData.occupancyType === option.value}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span className="font-medium text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                Amenities <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {amenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center cursor-pointer px-3 py-2.5 rounded-lg border ${
                      formData.amenities.includes(amenity)
                        ? "bg-green-50 border-green-500 text-green-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    } transition duration-200`}
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleCheckboxChange}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                         formData.amenities.includes(amenity) ? "bg-green-500 border-green-500" : "border-gray-400"
                    }`}>
                        {formData.amenities.includes(amenity) && (
                             <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3">
                 <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Other Amenities
                 </label>
                 <input
                    type="text"
                    name="customAmenities"
                    value={formData.customAmenities}
                    onChange={handleInputChange}
                    placeholder="Type other amenities here (separated by commas)... e.g. Swimming Pool, Garden"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
                 <p className="text-xs text-gray-400 mt-1">
                    If you selected "Amenities" above, these will be added to the list.
                 </p>
              </div>
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
             <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Description & Photos</h2>
                <p className="text-sm text-gray-500">Make your listing stand out visually.</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the vibe, nearby landmarks, house rules, and what makes your place special..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Upload Images <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group">
                <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center text-gray-500">
                     <UploadIcon />
                     <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
                     <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
                </div>
              </div>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview ${index}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 opacity-80 hover:opacity-100 shadow-sm transition-opacity"
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
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole="owner" isLoggedIn={true} />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
             <h1 className="text-3xl font-bold text-gray-900">Add New Listing</h1>
             <p className="text-gray-500 mt-1">Connect with students and migrants by listing your property on Zip Nivasa.</p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between relative">
                     <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-0 rounded-full mx-4"></div>
                     <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-0 rounded-full mx-4 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                     ></div>

                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                                    currentStep >= step.id
                                        ? "bg-blue-600 border-white text-white shadow-lg scale-110"
                                        : "bg-gray-200 border-white text-gray-500"
                                }`}
                            >
                                {step.icon}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                                currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                            }`}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                ) : <div></div>}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                        isStepValid 
                        ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5" 
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Next Step
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isStepValid || loading}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                        isStepValid && !loading
                        ? "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5" 
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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
      <Footer />
    </div>
    
  );
};

export default AddListing;