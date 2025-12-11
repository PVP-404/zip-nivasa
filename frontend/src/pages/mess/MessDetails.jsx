import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
  lazy,
  Suspense,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  getMessById,
  submitMessRating,
  getAllMesses,
} from "../../services/messService";

import RatingStars from "./components/RatingStars";
import MenuSection from "./components/MenuSection";
import SpecialToday from "./components/SpecialToday";

import {
  MapPin,
  Users,
  Phone,
  Star,
  MessageCircle,
  Camera,
  UtensilsCrossed,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Clock,
  Check,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Copy,
  Shield,
  Utensils,
  Navigation,
  Send,
  AlertCircle,
  Info,
  Award,
  TrendingUp,
  Zap,
  Loader2,
} from "lucide-react";

// Lazy load heavy components
const PGMapModal = lazy(() => import("../../components/maps/PGMapModal"));

// ============ UTILITY FUNCTIONS ============
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const formatTimeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds: s } of intervals) {
    const interval = Math.floor(seconds / s);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

const createFullAddress = (mess) => {
  if (mess.streetAddress && mess.district && mess.state && mess.pincode) {
    return `${mess.streetAddress}, ${mess.district}, ${mess.state} - ${mess.pincode}`;
  }
  return mess.mapplsAddress || mess.location || "Address will be updated soon";
};

// ============ CUSTOM HOOKS ============
const useMessData = (id) => {
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarMesses, setSimilarMesses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getMessById(id);
        const data = res?.mess || res;

        if (!data || data.error) throw new Error("Mess not found");

        if (isMounted) {
          setMess(data);

          // Fetch similar messes in background
          getAllMesses()
            .then((allMesses) => {
              if (isMounted) {
                const similar = allMesses
                  .filter((m) => m._id !== id && m.type === data.type)
                  .slice(0, 4);
                setSimilarMesses(similar);
              }
            })
            .catch(console.error);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [id]);

  const refreshMess = useCallback(async () => {
    const res = await getMessById(id);
    setMess(res?.mess || res);
  }, [id]);

  return { mess, loading, error, similarMesses, refreshMess };
};

const useSavedMess = (id) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedMesses") || "[]");
    setIsSaved(saved.includes(id));
  }, [id]);

  const toggleSave = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("savedMesses") || "[]");
    const updated = isSaved ? saved.filter((m) => m !== id) : [...saved, id];
    localStorage.setItem("savedMesses", JSON.stringify(updated));
    setIsSaved(!isSaved);
  }, [id, isSaved]);

  return { isSaved, toggleSave };
};

const useStickyTabs = (heroRef) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [heroRef]);

  return isSticky;
};

// ============ DERIVED DATA HOOK ============
const useDerivedData = (mess) =>
  useMemo(() => {
    if (!mess) return null;

    const images =
      mess.images?.length > 0
        ? mess.images
        : ["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800"];

    const ratings = Array.isArray(mess.ratings) ? mess.ratings : [];
    const avgRating =
      mess.averageRating ??
      (ratings.length > 0
        ? ratings.reduce((a, b) => a + (b.stars || 0), 0) / ratings.length
        : 0);

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: ratings.filter((r) => r.stars === star).length,
      percentage:
        ratings.length > 0
          ? (ratings.filter((r) => r.stars === star).length / ratings.length) * 100
          : 0,
    }));

    const fullAddress = createFullAddress(mess);

    return {
      images,
      ratings,
      avgRating,
      ratingDistribution,
      fullAddress,
      displayAddress: mess.mapplsAddress || fullAddress,
      googleSearch: encodeURIComponent(`${mess.title || "Mess"} ${fullAddress}`),
      hasSpecialToday: mess.specialToday?.lunch || mess.specialToday?.dinner,
      contactNumber: mess.contact || "",
      ownerChatId: mess.messOwnerId || null,
      mapplsELOC: mess.mapplsEloc || null,
    };
  }, [mess]);

// ============ SMALL COMPONENTS ============

// Optimized Image with lazy loading
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img
        src={error ? "https://via.placeholder.com/400?text=Image+Not+Found" : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});

// Quick Stat
const QuickStat = memo(function QuickStat({ icon, label, value }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center justify-center text-emerald-600 mb-1.5">
        {icon}
      </div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
});

// Stat Card
const StatCard = memo(function StatCard({ icon, value, label, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
      <div className={`inline-flex p-3 rounded-xl border ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
});

// Share Menu
const ShareMenu = memo(function ShareMenu({ isOpen, onClose, onShare, copied }) {
  if (!isOpen) return null;

  const options = [
    { id: "copy", icon: copied ? Check : Copy, label: copied ? "Copied!" : "Copy Link", color: copied ? "text-green-500" : "text-slate-400" },
    { id: "whatsapp", icon: MessageCircle, label: "WhatsApp", bg: "bg-green-500" },
    { id: "twitter", icon: () => <span className="text-xs font-bold">𝕏</span>, label: "Twitter", bg: "bg-slate-900" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
      >
        {options.map(({ id, icon: Icon, label, color, bg }) => (
          <button
            key={id}
            onClick={() => onShare(id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            {bg ? (
              <div className={`w-6 h-6 ${bg} rounded-full flex items-center justify-center text-white`}>
                <Icon className="w-3 h-3" />
              </div>
            ) : (
              <Icon className={`w-5 h-5 ${color}`} />
            )}
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </button>
        ))}
      </motion.div>
    </>
  );
});

// Review Card
const ReviewCard = memo(function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {getInitials(review.studentName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 truncate">
              {review.studentName || "Anonymous"}
            </h4>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {formatTimeAgo(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.stars
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
});

// ============ TAB COMPONENTS ============

// Overview Tab
const OverviewTab = memo(function OverviewTab({ mess, derivedData, onMapOpen }) {
  const highlights = useMemo(
    () => [
      { icon: Utensils, label: "Fresh Food Daily" },
      { icon: Clock, label: "Flexible Timings" },
      { icon: Shield, label: "Hygienic Kitchen" },
      { icon: Users, label: "Home-like Food" },
      { icon: Star, label: "Top Rated" },
      { icon: TrendingUp, label: "Popular Choice" },
    ],
    []
  );

  const timings = useMemo(
    () => [
      { meal: "Breakfast", time: "7:30 AM - 9:30 AM" },
      { meal: "Lunch", time: "12:30 PM - 2:30 PM" },
      { meal: "Dinner", time: "7:30 PM - 9:30 PM" },
    ],
    []
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* About */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-500" />
            About This Mess
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {mess.description ||
              "A quality mess service offering hygienic and delicious meals. Our menu includes a variety of traditional and modern dishes prepared with fresh ingredients."}
          </p>
        </section>

        {/* Highlights */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Highlights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {highlights.map(({ icon: Icon, label }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            value={mess.capacity || "N/A"}
            label="Capacity"
            color="emerald"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            value={derivedData.avgRating > 0 ? derivedData.avgRating.toFixed(1) : "New"}
            label="Rating"
            color="yellow"
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5" />}
            value={derivedData.ratings.length}
            label="Reviews"
            color="blue"
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            value={mess.type || "Mixed"}
            label="Type"
            color="purple"
          />
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Location */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Location
          </h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {derivedData.displayAddress}
          </p>
          <button
            onClick={onMapOpen}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            View on Map
          </button>
        </div>

        {/* Timings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Meal Timings
          </h3>
          <div className="space-y-2">
            {timings.map(({ meal, time }) => (
              <div
                key={meal}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm font-medium text-slate-700">{meal}</span>
                <span className="text-sm text-slate-500">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Menu Tab
const MenuTab = memo(function MenuTab({ menu, specialToday }) {
  return (
    <div className="space-y-6">
      {specialToday?.lunch || specialToday?.dinner ? (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Today's Special
          </h2>
          <SpecialToday special={specialToday} />
        </section>
      ) : null}

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
          Weekly Menu
        </h2>
        <MenuSection menu={menu} />
      </section>
    </div>
  );
});

// Photos Tab
const PhotosTab = memo(function PhotosTab({ images, onImageClick }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Camera className="w-5 h-5 text-emerald-500" />
        Gallery ({images.length} photos)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageClick(idx)}
            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <OptimizedImage
              src={img}
              alt={`Photo ${idx + 1}`}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

// Reviews Tab
const ReviewsTab = memo(function ReviewsTab({
  ratings,
  avgRating,
  ratingDistribution,
  reviewFilter,
  setReviewFilter,
  showForm,
  setShowForm,
  rating,
  setRating,
  comment,
  setComment,
  isSubmitting,
  onSubmit,
}) {
  const filteredReviews = useMemo(() => {
    let filtered = [...ratings];
    if (reviewFilter !== "all") {
      filtered = filtered.filter((r) => r.stars === parseInt(reviewFilter));
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ratings, reviewFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Rating Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-slate-900 mb-2">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Based on {ratings.length} review{ratings.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Distribution */}
          <div className="space-y-2 mb-6">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <button
                key={star}
                onClick={() =>
                  setReviewFilter(reviewFilter === star.toString() ? "all" : star.toString())
                }
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  reviewFilter === star.toString()
                    ? "bg-emerald-50 ring-1 ring-emerald-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <span className="text-sm text-slate-600 w-6">{star}★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: star * 0.1 }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-6 text-right">{count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Write Your Review</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-200 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-sm"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting || !rating}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Badge */}
        {reviewFilter !== "all" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">
              Showing {reviewFilter}-star reviews
            </span>
            <button
              onClick={() => setReviewFilter("all")}
              className="text-emerald-600 hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Reviews */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-3">
            {filteredReviews.map((review, idx) => (
              <ReviewCard key={review._id || idx} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No reviews yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
});

// Location Tab
const LocationTab = memo(function LocationTab({ mess, derivedData, onMapOpen }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Address Details
        </h2>

        <div className="space-y-4">
          {[
            { label: "Full Address", value: derivedData.displayAddress },
            { label: "District", value: mess.district },
            { label: "State", value: mess.state },
            { label: "Pincode", value: mess.pincode },
          ]
            .filter((item) => item.value)
            .map(({ label, value }) => (
              <div key={label}>
                <label className="text-xs text-slate-500 uppercase tracking-wide">
                  {label}
                </label>
                <p className="text-slate-800 font-medium">{value}</p>
              </div>
            ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onMapOpen}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${derivedData.googleSearch}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Google Maps
          </a>
        </div>
      </div>

      <div
        onClick={onMapOpen}
        className="bg-slate-100 rounded-2xl h-72 lg:h-auto flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <span className="text-slate-500 font-medium">Click to view map</span>
        </div>
      </div>
    </div>
  );
});

// Similar Messes
const SimilarMesses = memo(function SimilarMesses({ messes }) {
  if (messes.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Similar Messes</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {messes.map((mess) => (
          <Link
            key={mess._id}
            to={`/mess/${mess._id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
              <OptimizedImage
                src={mess.images?.[0] || "https://via.placeholder.com/300"}
                alt={mess.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-slate-900 text-sm truncate">
                {mess.title}
              </h3>
              <p className="text-xs text-slate-500 truncate mb-2">{mess.location}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600 text-sm">
                  {formatPrice(mess.price)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                {mess.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{mess.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});

// Mobile CTA
const MobileCTA = memo(function MobileCTA({ mess, contactNumber }) {
  if (!mess) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 z-40">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-lg font-bold text-emerald-600">
            {formatPrice(mess.price)}
          </div>
          <div className="text-xs text-slate-500">per month</div>
        </div>
        <a
          href={contactNumber ? `tel:${contactNumber}` : undefined}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
            contactNumber
              ? "bg-emerald-600 text-white active:bg-emerald-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
      </div>
    </div>
  );
});

// Image Gallery Modal
const ImageModal = memo(function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
  title,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    },
    [images.length, onClose, setCurrentIndex]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="p-4 flex items-center justify-center gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                idx === currentIndex
                  ? "ring-2 ring-white scale-105"
                  : "opacity-50 hover:opacity-75"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Loading Skeleton
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16 bg-white border-b border-slate-200" />

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-4 p-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
            <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Error State
const ErrorState = memo(function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Mess Not Found</h2>
        <p className="text-slate-500 mb-6">
          {error || "The mess you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/messes"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Browse Messes
          </Link>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
});

// ============ MAIN COMPONENT ============
const MessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Data hooks
  const { mess, loading, error, similarMesses, refreshMess } = useMessData(id);
  const derivedData = useDerivedData(mess);
  const { isSaved, toggleSave } = useSavedMess(id);
  const isTabsSticky = useStickyTabs(heroRef);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");

  // Handlers
  const handleShare = useCallback(
    async (platform) => {
      const url = window.location.href;
      const title = mess?.title || "Check out this mess";

      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(url);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          break;
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`);
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
          );
          break;
        default:
          if (navigator.share) {
            await navigator.share({ title, url });
          }
      }
      setShowShareMenu(false);
    },
    [mess?.title]
  );

  const handleSubmitReview = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Anonymous";

    if (!userId) {
      navigate("/login", { state: { from: `/mess/${id}` } });
      return;
    }

    if (!rating) return;

    setIsSubmitting(true);

    try {
      await submitMessRating(id, {
        studentId: userId,
        studentName: userName,
        stars: rating,
        comment,
      });

      await refreshMess();
      setRating(0);
      setComment("");
      setShowRatingForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, rating, comment, navigate, refreshMess]);

  // Loading & Error states
  if (loading) return <LoadingSkeleton />;
  if (error || !mess) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  const TABS = ["overview", "menu", "photos", "reviews", "location"];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Map Modal */}
      <Suspense fallback={null}>
        {isMapOpen && (
          <PGMapModal
            open={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            eloc={derivedData.mapplsELOC}
            address={derivedData.displayAddress}
            pg={mess}
          />
        )}
      </Suspense>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={derivedData.images}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
        title={mess.title}
      />

      <main className="pb-24 lg:pb-8">
        {/* Breadcrumbs */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <Link to="/messes" className="text-slate-500 hover:text-emerald-600 transition-colors">
                Messes
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 font-medium truncate max-w-[180px]">
                {mess.title}
              </span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div ref={heroRef} className="bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 lg:p-6">
              {/* Image Gallery */}
              <div className="relative aspect-[4/3] lg:aspect-[16/10] lg:rounded-2xl overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <OptimizedImage
                      src={derivedData.images[currentImageIndex]}
                      alt={`${mess.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {derivedData.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? derivedData.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev + 1) % derivedData.images.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </>
                )}

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {derivedData.images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? "bg-white w-6"
                          : "bg-white/50 w-1.5 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>

                {/* View All */}
                <button
                  onClick={() => setImageModalOpen(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all text-sm font-medium"
                >
                  <Camera className="w-4 h-4" />
                  {derivedData.images.length} photos
                </button>

                {/* Type Badge */}
                {mess.type && (
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                        mess.type.toLowerCase() === "veg"
                          ? "bg-green-500 text-white"
                          : mess.type.toLowerCase() === "non-veg"
                          ? "bg-red-500 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {mess.type}
                    </span>
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div className="p-5 lg:p-0 lg:py-2">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1.5">
                      {mess.title}
                    </h1>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">{mess.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSave}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSaved
                          ? "bg-red-50 border-red-200 text-red-500"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-slate-300 transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <ShareMenu
                        isOpen={showShareMenu}
                        onClose={() => setShowShareMenu(false)}
                        onShare={handleShare}
                        copied={copiedLink}
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {derivedData.avgRating > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-slate-900">
                        {derivedData.avgRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {derivedData.ratings.length} reviews
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(mess.price)}
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <QuickStat
                    icon={<Users className="w-4 h-4" />}
                    label="Capacity"
                    value={mess.capacity || "N/A"}
                  />
                  <QuickStat icon={<Clock className="w-4 h-4" />} label="Hours" value="8AM-9PM" />
                  <QuickStat icon={<Utensils className="w-4 h-4" />} label="Meals" value="3/day" />
                </div>

                {/* Today's Special */}
                {derivedData.hasSpecialToday && (
                  <div className="mb-5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-amber-800 text-sm">Today's Special</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      {mess.specialToday.lunch && <p>Lunch: {mess.specialToday.lunch}</p>}
                      {mess.specialToday.dinner && <p>Dinner: {mess.specialToday.dinner}</p>}
                    </div>
                  </div>
                )}

                {/* Desktop CTA */}
                <div className="hidden lg:flex flex-col gap-3">
                  <a
                    href={derivedData.contactNumber ? `tel:${derivedData.contactNumber}` : undefined}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      derivedData.contactNumber
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={
                        derivedData.contactNumber
                          ? `https://wa.me/${derivedData.contactNumber}?text=${encodeURIComponent(
                              `Hi, I'm interested in ${mess.title}`
                            )}`
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        derivedData.contactNumber
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>

                    {derivedData.ownerChatId && (
                      <Link
                        to={`/chat/${derivedData.ownerChatId}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Chat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`sticky top-0 bg-white/95 backdrop-blur-sm z-30 border-b border-slate-200 transition-shadow ${
            isTabsSticky ? "shadow-sm" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "reviews" && derivedData.ratings.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
                      {derivedData.ratings.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "overview" && (
                <OverviewTab
                  mess={mess}
                  derivedData={derivedData}
                  onMapOpen={() => setIsMapOpen(true)}
                />
              )}
              {activeTab === "menu" && (
                <MenuTab menu={mess.menu} specialToday={mess.specialToday} />
              )}
              {activeTab === "photos" && (
                <PhotosTab
                  images={derivedData.images}
                  onImageClick={(idx) => {
                    setCurrentImageIndex(idx);
                    setImageModalOpen(true);
                  }}
                />
              )}
              {activeTab === "reviews" && (
                <ReviewsTab
                  ratings={derivedData.ratings}
                  avgRating={derivedData.avgRating}
                  ratingDistribution={derivedData.ratingDistribution}
                  reviewFilter={reviewFilter}
                  setReviewFilter={setReviewFilter}
                  showForm={showRatingForm}
                  setShowForm={setShowRatingForm}
                  rating={rating}
                  setRating={setRating}
                  comment={comment}
                  setComment={setComment}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmitReview}
                />
              )}
              {activeTab === "location" && (
                <LocationTab
                  mess={mess}
                  derivedData={derivedData}
                  onMapOpen={() => setIsMapOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <SimilarMesses messes={similarMesses} />
        </div>
      </main>

      <MobileCTA mess={mess} contactNumber={derivedData.contactNumber} />
      <Footer />
    </div>
  );
};

export default memo(MessDetails);