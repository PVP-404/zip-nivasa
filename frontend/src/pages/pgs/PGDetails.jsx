// frontend/src/pages/pgs/PGDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import ZipNivasaMap from "../../components/ZipNivasaMap";

const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d={path} />
  </svg>
);

const StarRating = ({ rating = 4.5 }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="ml-2 text-sm font-semibold text-gray-700">
      {rating}
    </span>
  </div>
);

const PGDetails = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // ⭐ NEW → Map Modal State
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
          allData.filter((p) => p._id !== id).slice(0, 3)
        );
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !pg)
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading property details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  const images =
    pg.images?.length > 0
      ? pg.images
      : ["https://via.placeholder.com/800x600"];

  const rating = pg.rating || 4.5;

  // ⭐ Create marker object for map
  const pgMarker = {
    id: pg._id,
    type: "pg",
    name: pg.title,
    address: pg.address,
    location: pg.location,
    lat: pg.latitude,
    lng: pg.longitude,
    extra: { monthlyRent: pg.monthlyRent },
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {/* Map Modal */}
          {isMapOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-4 relative">
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="absolute top-3 right-3 text-gray-700 hover:text-black text-xl"
                >
                  ✕
                </button>

                <h2 className="text-xl font-bold mb-4">
                  PG Location on Map
                </h2>

                <ZipNivasaMap
                  markers={[pgMarker]}
                  initialCenter={{
                    lat: pg.latitude,
                    lng: pg.longitude,
                  }}
                  showUserLocation={true}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* BREADCRUMB */}
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
                    to="/dashboard"
                    className="hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>›</li>
                <li className="text-gray-900 font-medium truncate">
                  {pg.title}
                </li>
              </ol>
            </nav>

            {/* HEADER CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {pg.title}
                  </h1>

                  <StarRating rating={rating} />

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
                    <span className="flex items-center gap-1.5">
                      <Icon
                        path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        className="w-4 h-4"
                      />
                      {pg.location}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1.5">
                      <Icon
                        path="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                        className="w-4 h-4"
                      />
                      {pg.propertyType || "PG"}
                    </span>

                    <span>•</span>
                    <span>{pg.beds || 0} Beds</span>

                    {/* ⭐ VIEW ON MAP BUTTON */}
                    <button
                      onClick={() => setIsMapOpen(true)}
                      className="ml-3 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
                    >
                      View on Map
                    </button>
                  </div>
                </div>

                <div className="lg:min-w-[200px]">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 px-6 py-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-1">Rent</p>
                    <p className="text-4xl font-bold text-indigo-600">
                      ₹{pg.monthlyRent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      + maintenance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* IMAGE GALLERY */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={
                      pg.images?.length > 0
                        ? `http://localhost:5000${images[selectedImage]}`
                        : images[selectedImage]
                    }
                    className="w-full h-96 object-cover"
                    alt={`PG ${selectedImage + 1}`}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage(
                            (selectedImage - 1 + images.length) %
                              images.length
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <Icon
                          path="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          className="w-5 h-5 text-gray-700"
                        />
                      </button>

                      <button
                        onClick={() =>
                          setSelectedImage(
                            (selectedImage + 1) % images.length
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <Icon
                          path="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          className="w-5 h-5 text-gray-700"
                        />
                      </button>
                    </>
                  )}
                </div>

                {/* THUMBNAILS */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === i
                            ? "border-indigo-600 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={
                            pg.images?.length > 0
                              ? `http://localhost:5000${img}`
                              : img
                          }
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* ABOUT DESCRIPTION */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path="M13 6a3 3 0 11-6 0 3 3 0 016 0z" />
                    About this Property
                  </h2>
                  <p className="text-gray-700">
                    {pg.description ||
                      "A comfortable and well-maintained property."}
                  </p>
                </div>

                {/* AMENITIES */}
                {pg.amenities?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon path="M9 6a3 3 0 11-6 0 3 3 0 016 0z" />
                      Amenities & Facilities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pg.amenities.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg p-3"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Icon
                              path="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              className="w-4 h-4 text-green-600"
                            />
                          </div>
                          <span className="text-sm font-medium">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* IMPORTANT INFO */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    Important Information
                  </h2>

                  <div className="space-y-3 text-gray-700">
                    {[
                      "Security deposit may be required",
                      "Notice period typically 1 month",
                      "Contact owner for full terms",
                    ].map((info, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon
                          path="M10 18a8 8 0 100-16 8 8 0 000 16zM11 6a1 1 0 10-2 0v4l2.828 2.829a1 1 0 001.415-1.415L11 9.586V6z"
                          className="w-5 h-5 text-indigo-600"
                        />
                        <p className="text-sm">{info}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONTACT SIDEBAR */}
              <div className="space-y-6">
                {/* OWNER CONTACT */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Contact Owner
                  </h3>

                  <a
                    href={`tel:${pg.owner?.phone || ""}`}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md flex justify-center mb-3"
                  >
                    Call Owner
                  </a>

                  <a
                    href={`https://wa.me/${pg.owner?.phone ||
                      ""}?text=Hi, I am interested in your PG: ${encodeURIComponent(
                      pg.title
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-md flex justify-center mb-3"
                  >
                    WhatsApp
                  </a>

                  <Link
                    to={`/chat/${pg.owner?._id}`}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex justify-center"
                  >
                    Message Owner
                  </Link>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Response time: Within 24 hours
                  </p>
                </div>

                {/* PROPERTY DETAILS */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Property Details
                  </h3>

                  <div className="space-y-3">
                    {[
                      { label: "Property Type", value: pg.propertyType },
                      { label: "Available Beds", value: pg.beds },
                      {
                        label: "Monthly Rent",
                        value: `₹${pg.monthlyRent.toLocaleString()}`,
                        highlight: true,
                      },
                      { label: "Rating", value: rating, isRating: true },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <span className="text-gray-600 text-sm">
                          {item.label}
                        </span>

                        {item.isRating ? (
                          <StarRating rating={item.value} />
                        ) : (
                          <span
                            className={`font-semibold ${
                              item.highlight
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
            </div>

            {/* RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className="mt-12 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Similar Properties
                  </h2>

                  <Link
                    to="/dashboard"
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <Link
                      key={rec._id}
                      to={`/services/pg/${rec._id}`}
                      className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition overflow-hidden"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            rec.images?.[0]
                              ? `http://localhost:5000${rec.images[0]}`
                              : "https://via.placeholder.com/400"
                          }
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />

                        <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-lg shadow">
                          <p className="text-sm font-bold text-indigo-600">
                            ₹{rec.monthlyRent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                          {rec.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                          <Icon
                            path="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z"
                          />
                          {rec.location}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {rec.propertyType || "PG"}
                          </span>
                          <span className="text-indigo-600 text-sm font-medium group-hover:underline">
                            View →
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
  );
};

export default PGDetails;
