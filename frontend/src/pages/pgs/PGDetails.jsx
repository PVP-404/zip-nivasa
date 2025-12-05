import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import PGMapModal from "../../components/maps/PGMapModal";
import AppLayout from "../../layouts/AppLayout";

const Icon = ({ path, className = "w-5 h-5", stroke = false }) => (
  <svg
    className={className}
    fill={stroke ? "none" : "currentColor"}
    stroke={stroke ? "currentColor" : "none"}
    strokeWidth={stroke ? "2" : "0"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarRating = ({ rating = 4.5, size = "w-5 h-5" }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`${size} ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"
          }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="ml-1 text-sm font-semibold text-gray-700">({rating})</span>
  </div>
);
const PGDetails = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pgRes, allRes] = await Promise.all([
          fetch(`http://localhost:5000/api/pgs/${id}`),
          fetch(`http://localhost:5000/api/pgs`),
        ]);

        const pgData = await pgRes.json();
        const allData = await allRes.json();

        setPg(pgData.pg);
        setRecommendations(
          allData.pgs.filter((p) => p._id !== id).slice(0, 3)
        );
      } catch (err) {
        console.error("Error fetching PG:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !pg)
    return (
      <div className="flex h-screen bg-gray-50">
        
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <Sidebar />
          <div className="flex flex-1 justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading premium student accommodation details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  const images =
    pg.images?.length > 0
      ? pg.images
      : ["https://via.placeholder.com/1200x600?text=No+Image+Available"];

  const rating = pg.rating || 4.5;

  const fullAddress =
    pg.streetAddress && pg.pincode && pg.district && pg.state
      ? `${pg.streetAddress}, ${pg.district}, ${pg.state} - ${pg.pincode}`
      : `${pg.address}, ${pg.location}`;

  const displayAddress = pg.mapplsAddress || fullAddress;

  const mapplsELOC = pg.mapplsEloc || pg.eloc || null;

  const mapplsLink = mapplsELOC ? `https://mappls.com/${mapplsELOC}` : null;

  const googleSearch = encodeURIComponent(
    `${pg.title} ${displayAddress || ""}`
  );

  return (
    <AppLayout>
      <div className="flex h-screen bg-white overflow-hidden">
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <PGMapModal
          open={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          eloc={mapplsELOC}
          address={displayAddress}
          pg={pg}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <nav className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-gray-600">
                <li>
                  <Link to="/" className="hover:text-indigo-600">
                    Home
                  </Link>
                </li>
                <li>›</li>
                <li>
                  <Link
                    to="/dashboard/student"
                    className="hover:text-indigo-600"
                  >
                  </Link>
                </li>
                <li>›</li>
                <li className="text-gray-900 font-medium truncate">
                  {pg.title}
                </li>
              </ol>
            </nav>

            <div className="bg-white rounded-xl mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                {pg.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 mb-6">
                <StarRating rating={rating} size="w-4 h-4" />
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon
                    path="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 000 2h1a1 1 0 100-2h-1z"
                    className="w-5 h-5"
                    stroke
                  />
                  {pg.propertyType}
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1.5">
                  <Icon
                    path="M17.657 16.657L13.414 20.9A2 2 0 0110.5 20.9L6.343 16.657A8 8 0 1117.657 16.657z"
                    className="w-5 h-5"
                    stroke
                  />
                  {pg.location}
                </span>
                <span className="text-gray-400">•</span>
                <span>{pg.beds} Beds Available</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4">
                <div className="lg:col-span-3 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={images[selectedImage]}


                    className="w-full h-[450px] object-cover"
                    alt="PG main"
                  />
                </div>

                {images.length > 1 && (
                  <div className="hidden lg:block space-y-3 pt-2 lg:pt-0">
                    {images.slice(0, 4).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-full h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i
                            ? "border-indigo-600 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-indigo-400"
                          }`}
                      >
                        <img
                          src={img}

                          className="w-full h-full object-cover"
                          alt={`PG thumbnail ${i + 1}`}
                        />
                      </button>
                    ))}
                    {images.length > 4 && (
                      <div className="w-full h-24 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 text-sm font-semibold border-2 border-gray-200">
                        +{images.length - 4} More Photos
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700">
                    <Icon
                      path="M17.657 16.657L13.414 20.9A2 2 0 0110.5 20.9L6.343 16.657A8 8 0 1117.657 16.657z"
                      className="w-6 h-6"
                      stroke
                    />
                    Full Location
                  </h2>

                  <p className="text-lg font-medium text-gray-800 mb-4">
                    {displayAddress}
                  </p>

                  <div className="flex gap-4 mt-4 flex-wrap">
                    <button
                      onClick={() => setIsMapOpen(true)}
                      disabled={!mapplsELOC && !displayAddress}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${mapplsELOC || displayAddress
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed "
                        }`}
                    >
                      <Icon
                        path="M17.657 16.657L13.414 20.9A2 2 0 0110.5 20.9L6.343 16.657A8 8 0 1117.657 16.657z"
                        className="w-5 h-5"
                        stroke
                      />
                      View on Map
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${googleSearch}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-lg shadow-red-200"
                    >
                      <img
                        src="https://www.google.com/images/branding/product/1x/maps_48dp.png"
                        className="w-5 h-5 rounded-full"
                        alt="Google Maps Logo"
                      />
                      Directions
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <Icon
                      path="M4 6h16M4 12h16M4 18h16"
                      className="w-6 h-6"
                      stroke
                    />
                    Property Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {pg.description}
                  </p>
                </div>
                {pg.amenities?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                      <Icon
                        path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        className="w-6 h-6"
                        stroke
                      />
                      Amenities & Facilities
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pg.amenities.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm font-medium text-indigo-800 transition hover:bg-indigo-100"
                        >
                          <Icon
                            path="M5 13l4 4L19 7"
                            className="w-5 h-5 text-indigo-600"
                            stroke
                          />
                          <span className="truncate">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon
                      path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      className="w-6 h-6"
                      stroke
                    />
                    Key Property Specifications
                  </h3>

                  <div className="space-y-4">
                    {[
                      { label: "Property Type", value: pg.propertyType },
                      { label: "Occupancy Type", value: pg.occupancyType },
                      { label: "Available Beds", value: pg.beds },
                      {
                        label: "Security Deposit",
                        value: `₹${pg.deposit.toLocaleString()}`,
                      },
                      {
                        label: "Monthly Rent",
                        value: `₹${pg.monthlyRent.toLocaleString()}`,
                        highlight: true,
                      },
                      { label: "Rating", value: rating, isRating: true },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-gray-600 font-medium text-base">
                          {item.label}
                        </span>

                        {item.isRating ? (
                          <StarRating rating={item.value} size="w-4 h-4" />
                        ) : (
                          <span
                            className={`font-bold text-base ${item.highlight
                                ? "text-indigo-600"
                                : "text-gray-900"
                              }`}
                          >
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 px-8 py-6 rounded-xl text-center shadow-lg">
                    <p className="text-base text-gray-600 mb-1">Starting From</p>
                    <p className="text-5xl font-extrabold text-indigo-700">
                      ₹{pg.monthlyRent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      per month (Excl. maintenance)
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      Ready to Book? Connect Now!
                    </h3>

                    <a
                      href={`tel:${pg.owner?.phone}`}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-md flex justify-center items-center gap-2 mb-3"
                    >
                      <Icon
                        path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        className="w-5 h-5"
                      />
                      Call Owner
                    </a>

                    <a
                      href={`https://wa.me/${pg.owner?.phone}?text=Hi%2C%20I%20am%20interested%20in%20your%20PG:%20${encodeURIComponent(
                        pg.title
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition shadow-md flex justify-center items-center gap-2 mb-3"
                    >
                      <Icon
                        path="M8 9a1 1 0 100-2 1 1 0 000 2zM15 11a1 1 0 100-2 1 1 0 000 2zM12 9a1 1 0 100-2 1 1 0 000 2z"
                        className="w-5 h-5"
                      />
                      WhatsApp Inquiry
                    </a>

                    <Link
                      to={`/chat/${pg.owner?._id}`}
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2"
                    >
                      <Icon
                        path="M7 8h10M7 12h4m-4 8h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        className="w-5 h-5"
                        stroke
                      />
                      Message Owner In-App
                    </Link>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      All communications are protected by Zip Nivasa Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {recommendations.length > 0 && (
              <div className="mt-16 mb-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Find Similar Accommodations
                  </h2>
                  <Link
                    to="/dashboard/student"
                    className="text-indigo-600 font-medium hover:text-indigo-700 text-base flex items-center gap-1"
                  >
                    View All{" "}
                    <Icon
                      path="M17 8l4 4m0 0l-4 4m4-4H3"
                      className="w-5 h-5"
                      stroke
                    />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <Link
                      key={rec._id}
                      to={`/services/pg/${rec._id}`}
                      className="bg-white rounded-xl border shadow-md hover:shadow-xl transition overflow-hidden group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            rec.images?.[0]
                              ? `http://localhost:5000${rec.images[0]}`
                              : "https://via.placeholder.com/400"
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={rec.title}
                        />

                        <div className="absolute top-3 right-3 bg-white px-4 py-1.5 rounded-lg shadow-md">
                          <p className="text-lg font-bold text-indigo-600">
                            ₹{rec.monthlyRent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {rec.title}
                        </h3>

                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                          <Icon
                            path="M17.657 16.657L13.414 20.9A2 2 0 0110.5 20.9L6.343 16.657A8 8 0 1117.657 16.657z"
                            className="w-4 h-4 text-gray-400"
                            stroke
                          />
                          {rec.location}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                            {rec.propertyType}
                          </span>

                          <span className="text-indigo-600 text-base font-semibold group-hover:underline">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>
    </div>
      </AppLayout>
  );
};

export default PGDetails;
