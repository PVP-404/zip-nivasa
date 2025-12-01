// src/pages/dashboard/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import { getAllMesses } from "../../services/messService";

const mockLaundryList = [
  {
    id: 1,
    name: "Quick Wash",
    location: "Main Street",
    rating: 4.3,
    services: ["Washing", "Ironing", "Dry Cleaning"],
    price: "₹50/kg",
  },
  {
    id: 2,
    name: "Fresh Clean",
    location: "Campus Road",
    rating: 4.6,
    services: ["Washing", "Ironing"],
    price: "₹40/kg",
  },
];

// --- Sub-Component: Image Slideshow ---
const ImageSlideshow = ({ images, alt, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If we have 0 or 1 image, no need for a timer
    if (!images || images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(intervalId);
  }, [images]);

  const currentImage = images && images.length > 0 
    ? images[currentIndex] 
    : "https://via.placeholder.com/400?text=No+Image";

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <img
        src={currentImage}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
      />
      
      {/* Optional: Page Indicator dots if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${
                idx === currentIndex ? "bg-white scale-110" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const StudentDashboard = () => {
  const username = localStorage.getItem("username") || "Student";

  const navigate = useNavigate();
  const [messes, setMesses] = useState([]);
  const [housingOptions, setHousingOptions] = useState([]);
  const [laundryOptions, setLaundryOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedMess, setSelectedMess] = useState(null);
  const [activeService, setActiveService] = useState("housing");
  const [loading, setLoading] = useState(true);

  // 🔴 Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const overlayRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch PGs
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
        // Store ALL images properly formatted
        images: pg.images?.length > 0 
          ? pg.images.map(img => `http://localhost:5000${img}`)
          : ["https://via.placeholder.com/400?text=Zip+Nivasa"],
        amenities: pg.amenities,
        contact: "+919999999999",
      }));
      setHousingOptions(formattedPGs);
    } catch (err) {
      console.error("Failed to load PG listings:", err);
    }
  };

  const fetchMesses = async () => {
    try {
      const res = await getAllMesses();
      setMesses(res);
    } catch (error) {
      console.error("Error fetching messes", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMesses(), fetchPGs()]);
      setLaundryOptions(mockLaundryList);
      setLoading(false);
    };
    loadData();
  }, []);

  // Close modal on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedMess(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Service filters
  const filtered = {
    mess: messes.filter((m) =>
      (m.title || m.name || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    ),
    housing: housingOptions.filter(
      (h) =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.location.toLowerCase().includes(query.toLowerCase()) ||
        h.type.toLowerCase().includes(query.toLowerCase())
    ),
    laundry: laundryOptions.filter(
      (l) =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.services.some((s) =>
          s.toLowerCase().includes(query.toLowerCase())
        )
    ),
  };

  const handleServiceChange = (service) => {
    setActiveService(service);
    setQuery("");
    if (searchInputRef.current) searchInputRef.current.value = "";
  };

  const services = [
    {
      key: "mess",
      title: "Mess Services",
      desc: "Healthy daily meals",
      icon: "M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z",
    },
    {
      key: "housing",
      title: "Housing",
      desc: "PGs, Hostels & Flats",
      icon: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z",
    },
    {
      key: "laundry",
      title: "Laundry",
      desc: "Wash & Dry Clean",
      icon: "M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z",
    },
  ];

  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d={path} />
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  // Loading Skeleton Component
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col w-full h-full overflow-hidden font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex flex-row flex-1 w-full h-full overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full overflow-y-auto custom-scrollbar">
          {/* GREETING SECTION */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Hello, {username} 👋
              </h1>
              <p className="text-gray-500 mt-1">
                Everything you need for a comfortable stay.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Student Account
               </span>
            </div>
          </div>

          {/* SERVICE SELECTION TABS */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.key}
                  onClick={() => handleServiceChange(s.key)}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    activeService === s.key
                      ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500 transform -translate-y-1"
                      : "bg-white border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className={`font-bold text-lg ${activeService === s.key ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {s.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${activeService === s.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon path={s.icon} className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sticky top-0 bg-gray-50 z-10 py-2">
            <h3 className="text-xl font-bold text-gray-800 self-start sm:self-center">
              {activeService === "housing" && "Explore Stays"}
              {activeService === "mess" && "Best Messes"}
              {activeService === "laundry" && "Laundry Shops"}
              <span className="text-gray-400 font-normal text-sm ml-2 hidden sm:inline-block">
                ({filtered[activeService].length} results)
              </span>
            </h3>

            <div className="relative w-full sm:w-80 group">
              <Icon
                path="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                ref={searchInputRef}
                placeholder={`Search ${activeService}...`}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
            
            {loading && (
               <>
                 <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
               </>
            )}

            {!loading && filtered[activeService].length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                   <Icon path="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" className="w-8 h-8 text-gray-400"/>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms.</p>
              </div>
            )}

            {/* --- HOUSING CARDS --- */}
            {!loading && activeService === "housing" &&
              filtered.housing.map((pg) => (
                <div
                  key={pg.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-52">
                    {/* Image Slideshow Component Used Here */}
                    <ImageSlideshow 
                        images={pg.images} 
                        alt={pg.name} 
                        className="h-full w-full"
                    />
                    
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <p className="text-sm font-bold text-indigo-700">
                        ₹{pg.price}<span className="text-xs text-gray-500 font-normal">/mo</span>
                      </p>
                    </div>
                    {pg.rating && (
                      <div className="absolute top-3 left-3 bg-gray-900/60 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1 text-white">
                        <StarIcon />
                        <span className="text-xs font-bold">{pg.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {pg.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">{pg.type}</p>
                    </div>

                    <p className="text-sm text-gray-600 flex items-start gap-1.5 mb-4 line-clamp-1">
                      <Icon
                        path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      />
                      {pg.location}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex gap-3">
                      <a
                        href={`tel:${pg.contact}`}
                        className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg text-center text-sm font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Call
                      </a>
                      <Link
                        to={`/services/pg/${pg.id}`}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-center text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

            {/* --- MESS CARDS --- */}
            {!loading && activeService === "mess" &&
              filtered.mess.map((mess) => {
                const calculatedAvg =
                  mess.ratings && mess.ratings.length > 0
                    ? mess.ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / mess.ratings.length
                    : null;
                const avgRating = mess.averageRating ?? calculatedAvg;

                return (
                  <div
                    key={mess._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col relative"
                  >
                     <div className="absolute top-0 right-0 p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                            mess.type === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {mess.type}
                        </span>
                     </div>

                    <div className="mb-4 pr-8">
                      <h4 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {mess.title || mess.name}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Icon path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" className="w-3.5 h-3.5" />
                        {mess.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex bg-yellow-50 px-2 py-1 rounded-md">
                        <StarIcon />
                        {avgRating ? (
                            <span className="text-xs font-bold text-yellow-700 ml-1">{avgRating.toFixed(1)}</span>
                        ) : (
                            <span className="text-xs text-gray-400 ml-1">New</span>
                        )}
                      </div>
                      <span className="text-gray-300">|</span>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{mess.price}<span className="text-xs font-normal text-gray-500">/mo</span>
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/mess/${mess._id}`)}
                      className="mt-auto w-full bg-white border-2 border-indigo-50 text-indigo-600 py-2.5 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200"
                    >
                      View Menu & Details
                    </button>
                  </div>
                );
              })}

            {/* --- LAUNDRY CARDS --- */}
            {!loading && activeService === "laundry" &&
              filtered.laundry.map((laundry) => (
                <div
                  key={laundry.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-lg text-gray-900">{laundry.name}</h4>
                     <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-sm font-semibold">
                        <StarIcon /> {laundry.rating}
                     </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <Icon
                      path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      className="w-3.5 h-3.5"
                    />
                    {laundry.location}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {laundry.services.map((service, i) => (
                      <span
                        key={i}
                        className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between border-t pt-4">
                      <p className="text-lg font-bold text-gray-900">{laundry.price}</p>
                      <button className="text-indigo-600 text-sm font-bold hover:underline">
                          Contact
                      </button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>

      <Footer />

      {/* MESS MODAL - Improved UI */}
      {selectedMess && (
        <div
          ref={overlayRef}
          onClick={(e) =>
            e.target === overlayRef.current && setSelectedMess(null)
          }
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-indigo-600 p-6 text-white relative">
                <button
                    onClick={() => setSelectedMess(null)}
                    className="absolute top-4 right-4 text-indigo-200 hover:text-white bg-indigo-500/30 rounded-full p-1"
                >
                    <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-bold">{selectedMess.name}</h3>
                <p className="text-indigo-100 text-sm flex items-center gap-1 mt-1">
                    <Icon path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" className="w-4 h-4" />
                    {selectedMess.location}
                </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        selectedMess.type === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {selectedMess.type}
                    </span>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{selectedMess.price}</p>
                    <p className="text-xs text-gray-500">per month</p>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                   <Icon path="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" className="w-5 h-5 text-orange-500"/>
                   Today&apos;s Menu
                </h4>
                <ul className="space-y-2.5">
                  {selectedMess.menu.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedMess(null)}
                className="w-full mt-6 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;