// src/pages/dashboard/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

// Mock data
const mockMessList = [
  { id: 1, name: "Annapurna Mess", location: "Near Campus", rating: 4.5, type: "Veg", price: 3500, menu: ["Dal", "Rice", "Roti", "Sabzi"] },
  { id: 2, name: "Tasty Bites", location: "City Center", rating: 4.2, type: "Non-Veg", price: 4000, menu: ["Chicken Curry", "Rice", "Roti"] },
];

const mockLaundryList = [
  { id: 1, name: "Quick Wash", location: "Main Street", rating: 4.3, services: ["Washing", "Ironing", "Dry Cleaning"], price: "₹50/kg" },
  { id: 2, name: "Fresh Clean", location: "Campus Road", rating: 4.6, services: ["Washing", "Ironing"], price: "₹40/kg" },
];

const StudentDashboard = () => {
  const [messes, setMesses] = useState([]);
  const [housingOptions, setHousingOptions] = useState([]);
  const [laundryOptions, setLaundryOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [activeService, setActiveService] = useState("housing");

  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch PGs from backend
  const fetchPGs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pgs");
      const data = await res.json();

      const formattedPGs = data.map((pg) => ({
        id: pg._id,
        name: pg.title,
        type: pg.propertyType,
        location: pg.location,
        price: pg.monthlyRent,
        rating: 4.6,
        image: pg.images?.[0] ? `http://localhost:5000${pg.images[0]}` : "https://via.placeholder.com/400",
        amenities: pg.amenities,
        contact: "+919999999999",
      }));
      setHousingOptions(formattedPGs);
    } catch (err) {
      console.error("Failed to load PG listings:", err);
    }
  };

  useEffect(() => {
    setMesses(mockMessList);
    setLaundryOptions(mockLaundryList);
    fetchPGs();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedMess(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filters
  const filtered = {
    mess: messes.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    housing: housingOptions.filter((h) => 
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.location.toLowerCase().includes(query.toLowerCase()) ||
      h.type.toLowerCase().includes(query.toLowerCase())
    ),
    laundry: laundryOptions.filter((l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    ),
  };

  const handleServiceChange = (service) => {
    setActiveService(service);
    setQuery("");
    if (searchInputRef.current) searchInputRef.current.value = "";
  };

  // Service icons
  const services = [
    { key: "mess", title: "Mess Services", desc: "Explore mess options and menus", icon: "M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" },
    { key: "housing", title: "Housing Services", desc: "Find PGs, rooms & hostels", icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" },
    { key: "laundry", title: "Laundry Services", desc: "Find nearby laundry shops", icon: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" },
  ];

  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d={path} /></svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Student Dashboard</h1>
            <p className="text-gray-600">Find the best PGs, messes, and laundry services near you</p>
          </div>

          {/* Services */}
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Choose a Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {services.map((s) => (
                <div
                  key={s.key}
                  onClick={() => handleServiceChange(s.key)}
                  className={`bg-white p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                    activeService === s.key ? "border-indigo-500 ring-2 ring-indigo-100" : "border-gray-200"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${activeService === s.key ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <Icon path={s.icon} className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Search Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {activeService === "housing" ? "Explore PGs & Rooms" : activeService === "mess" ? "Mess Services" : "Laundry Services"}
              </h3>
              <p className="text-gray-600 text-sm">
                {activeService === "housing" ? "Find your perfect accommodation" : activeService === "mess" ? "Explore mess options" : "Find nearby laundry shops"}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Icon path="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                placeholder={`Search ${activeService}...`}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Housing */}
          {activeService === "housing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.housing.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PGs...</p>
                </div>
              ) : (
                filtered.housing.map((pg) => (
                  <div key={pg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img src={pg.image} alt={pg.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-md shadow-md">
                        <p className="text-sm font-bold text-indigo-600">₹{pg.price}/mo</p>
                      </div>
                      {pg.rating && (
                        <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                          <StarIcon />
                          <span className="text-sm font-semibold text-gray-700">{pg.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-semibold text-lg text-gray-900 mb-1 truncate">{pg.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{pg.type}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <Icon path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" className="w-4 h-4" />
                        {pg.location}
                      </p>
                      {pg.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pg.amenities.slice(0, 3).map((a, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">{a}</span>
                          ))}
                          {pg.amenities.length > 3 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{pg.amenities.length - 3}</span>}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <a href={`tel:${pg.contact}`} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-center font-medium hover:bg-indigo-700 transition-colors text-sm">Call</a>
                        <Link to={`/services/pg/${pg.id}`} className="flex-1 border border-indigo-600 text-indigo-600 py-2.5 rounded-lg text-center font-medium hover:bg-indigo-50 transition-colors text-sm">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Mess */}
          {activeService === "mess" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.mess.map((mess) => (
                <div key={mess.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{mess.name}</h4>
                      <p className="text-sm text-gray-600">{mess.location}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">{mess.type}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <StarIcon />
                    <span className="text-sm font-semibold text-gray-700">{mess.rating}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-4">₹{mess.price}/month</p>
                  <button onClick={() => setSelectedMess(mess)} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">View Menu</button>
                </div>
              ))}
            </div>
          )}

          {/* Laundry */}
          {activeService === "laundry" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.laundry.map((laundry) => (
                <div key={laundry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-lg text-gray-900 mb-1">{laundry.name}</h4>
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <Icon path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" className="w-4 h-4" />
                    {laundry.location}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <StarIcon />
                    <span className="text-sm font-semibold text-gray-700">{laundry.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {laundry.services.map((service, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">{service}</span>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{laundry.price}</p>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* Modal */}
      {selectedMess && (
        <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && setSelectedMess(null)} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedMess.name}</h3>
                <p className="text-gray-600">{selectedMess.location}</p>
              </div>
              <button onClick={() => setSelectedMess(null)} className="text-gray-400 hover:text-gray-600">
                <Icon path="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">{selectedMess.type}</span>
                <div className="flex items-center gap-1">
                  <StarIcon />
                  <span className="text-sm font-semibold text-gray-700">{selectedMess.rating}</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">₹{selectedMess.price}/month</p>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Today's Menu</h4>
              <ul className="space-y-2">
                {selectedMess.menu.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <Icon path="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setSelectedMess(null)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;