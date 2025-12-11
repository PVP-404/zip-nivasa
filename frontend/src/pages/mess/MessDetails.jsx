import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // npm i framer-motion

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getMessById, submitMessRating, getAllMesses } from "../../services/messService";

import RatingStars from "./components/RatingStars";
import MenuSection from "./components/MenuSection";
import SpecialToday from "./components/SpecialToday";
import PGMapModal from "../../components/maps/PGMapModal";

import {
  MapPin, Users, Phone, Star, MessageCircle, Camera, UtensilsCrossed,
  Calendar, X, ChevronLeft, ChevronRight, Share2, Heart, Clock, Check,
  Sparkles, ArrowLeft, ExternalLink, Copy, Shield, Wifi, Car, Utensils,
  Home, Building2, Navigation, Send, ThumbsUp, MoreHorizontal, Bookmark,
  AlertCircle, Info, Award, TrendingUp, Zap
} from "lucide-react";


const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getTimeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};


const MessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core state
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");

  // Similar messes
  const [similarMesses, setSimilarMesses] = useState([]);

  // Refs
  const heroRef = useRef(null);
  const tabsRef = useRef(null);
  const [isTabsSticky, setIsTabsSticky] = useState(false);


  useEffect(() => {
    const fetchMess = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await getMessById(id);
        const data = res?.mess || res;
        
        if (!data || data.error) {
          throw new Error('Mess not found');
        }
        
        setMess(data);

        // Fetch similar messes
        try {
          const allMesses = await getAllMesses();
          const similar = allMesses
            .filter(m => m._id !== id && m.type === data.type)
            .slice(0, 4);
          setSimilarMesses(similar);
        } catch (err) {
          console.error('Error fetching similar messes:', err);
        }

        // Check if saved
        const savedMesses = JSON.parse(localStorage.getItem('savedMesses') || '[]');
        setIsSaved(savedMesses.includes(id));

      } catch (err) {
        console.error("Error fetching mess:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMess();
    window.scrollTo(0, 0);
  }, [id]);

  // Sticky tabs observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsTabsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);


  const derivedData = useMemo(() => {
    if (!mess) return null;

    const images = mess.images?.length > 0
      ? mess.images
      : ["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800"];

    const ratings = Array.isArray(mess.ratings) ? mess.ratings : [];
    const avgRating = mess.averageRating ?? (
      ratings.length > 0
        ? ratings.reduce((a, b) => a + (b.stars || 0), 0) / ratings.length
        : 0
    );

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: ratings.filter(r => r.stars === star).length,
      percentage: ratings.length > 0 
        ? (ratings.filter(r => r.stars === star).length / ratings.length) * 100 
        : 0
    }));

    const fullAddress = mess.streetAddress && mess.district && mess.state && mess.pincode
      ? `${mess.streetAddress}, ${mess.district}, ${mess.state} - ${mess.pincode}`
      : mess.mapplsAddress || mess.location || "Address will be updated soon";

    return {
      images,
      ratings,
      avgRating,
      ratingDistribution,
      fullAddress,
      displayAddress: mess.mapplsAddress || fullAddress,
      googleSearch: encodeURIComponent(`${mess.title || "Mess"} ${fullAddress}`),
      hasSpecialToday: mess.specialToday && (mess.specialToday.lunch || mess.specialToday.dinner),
      contactNumber: mess.contact || "",
      ownerChatId: mess.messOwnerId || null,
      mapplsELOC: mess.mapplsEloc || null
    };
  }, [mess]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (!derivedData?.ratings) return [];
    
    let filtered = [...derivedData.ratings];
    
    if (reviewFilter !== "all") {
      filtered = filtered.filter(r => r.stars === parseInt(reviewFilter));
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [derivedData?.ratings, reviewFilter]);


  const handleImageNavigation = useCallback((direction) => {
    if (!derivedData?.images) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % derivedData.images.length;
      }
      return prev === 0 ? derivedData.images.length - 1 : prev - 1;
    });
  }, [derivedData?.images]);

  const handleSave = useCallback(() => {
    const savedMesses = JSON.parse(localStorage.getItem('savedMesses') || '[]');
    
    if (isSaved) {
      const updated = savedMesses.filter(m => m !== id);
      localStorage.setItem('savedMesses', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      savedMesses.push(id);
      localStorage.setItem('savedMesses', JSON.stringify(savedMesses));
      setIsSaved(true);
    }
  }, [id, isSaved]);

  const handleShare = useCallback(async (platform) => {
    const url = window.location.href;
    const title = mess?.title || 'Check out this mess';

    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      default:
        if (navigator.share) {
          await navigator.share({ title, url });
        }
    }
    setShowShareMenu(false);
  }, [mess?.title]);

  const submitRatingHandler = async () => {
    const studentId = localStorage.getItem("userId");
    const studentName = localStorage.getItem("userName") || "Anonymous";

    if (!studentId) {
      navigate('/login', { state: { from: `/mess/${id}` } });
      return;
    }
    
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitMessRating(id, { 
        studentId, 
        studentName,
        stars: rating, 
        comment 
      });

      const refreshed = await getMessById(id);
      setMess(refreshed?.mess || refreshed);

      setRating(0);
      setComment("");
      setShowRatingForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Error submitting review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !mess) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }


  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Map Modal */}
      <PGMapModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        eloc={derivedData.mapplsELOC}
        address={derivedData.displayAddress}
        pg={mess}
      />

      {/* Image Modal */}
      <ImageGalleryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={derivedData.images}
        currentIndex={currentImageIndex}
        onNavigate={handleImageNavigation}
        title={mess.title}
      />

      <main className="pb-24 lg:pb-8">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <Link to="/messes" className="text-slate-500 hover:text-emerald-600 transition-colors">
                Messes
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium truncate max-w-[200px]">
                {mess.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div ref={heroRef} className="bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 lg:p-6">
              {/* Image Gallery */}
              <div className="relative aspect-[4/3] lg:aspect-[16/10] lg:rounded-2xl overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={derivedData.images[currentImageIndex]}
                    alt={`${mess.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {derivedData.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {derivedData.images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                  {derivedData.images.length > 5 && (
                    <span className="text-white text-xs font-medium">
                      +{derivedData.images.length - 5}
                    </span>
                  )}
                </div>

                {/* View All Photos Button */}
                <button
                  onClick={() => setImageModalOpen(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-xl shadow-lg transition-all text-sm font-medium"
                >
                  <Camera className="w-4 h-4" />
                  View all {derivedData.images.length} photos
                </button>

                {/* Type Badge */}
                {mess.type && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                      mess.type.toLowerCase() === 'veg'
                        ? 'bg-green-500 text-white'
                        : mess.type.toLowerCase() === 'non-veg'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-slate-700'
                    }`}>
                      {mess.type} Mess
                    </span>
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div className="p-6 lg:p-0 lg:py-2">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                      {mess.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">{mess.location}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      className={`p-3 rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-slate-300 transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      
                      <ShareMenu
                        isOpen={showShareMenu}
                        onClose={() => setShowShareMenu(false)}
                        onShare={handleShare}
                        copiedLink={copiedLink}
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Summary */}
                {derivedData.avgRating > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-bold text-slate-900">
                        {derivedData.avgRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">
                        {derivedData.ratings.length}
                      </span> reviews
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">
                      {formatPrice(mess.price)}
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Includes all meals as per mess schedule
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <QuickStat
                    icon={<Users className="w-4 h-4" />}
                    label="Capacity"
                    value={mess.capacity || 'N/A'}
                  />
                  <QuickStat
                    icon={<Clock className="w-4 h-4" />}
                    label="Timings"
                    value="8AM - 9PM"
                  />
                  <QuickStat
                    icon={<Utensils className="w-4 h-4" />}
                    label="Meals"
                    value="3/day"
                  />
                </div>

                {/* Today's Special */}
                {derivedData.hasSpecialToday && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-amber-800">Today's Special</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      {mess.specialToday.lunch && (
                        <p><span className="font-medium">Lunch:</span> {mess.specialToday.lunch}</p>
                      )}
                      {mess.specialToday.dinner && (
                        <p><span className="font-medium">Dinner:</span> {mess.specialToday.dinner}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Desktop CTA */}
                <div className="hidden lg:block space-y-3">
                  <button
                    onClick={() => derivedData.contactNumber && (window.location.href = `tel:${derivedData.contactNumber}`)}
                    disabled={!derivedData.contactNumber}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold transition-all ${
                      derivedData.contactNumber
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={derivedData.contactNumber 
                        ? `https://wa.me/${derivedData.contactNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${mess.title}`)}`
                        : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                        derivedData.contactNumber
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                    
                    {derivedData.ownerChatId && (
                      <Link
                        to={`/chat/${derivedData.ownerChatId}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        In-App Chat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
<div
  ref={tabsRef}
  className={`sticky top-0 bg-white/95 backdrop-blur-sm relative z-[9999] border-b border-slate-200 transition-shadow ${
    isTabsSticky ? "shadow-md" : ""
  }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide pointer-events-auto">
      
      {["overview", "menu", "photos", "reviews", "location"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative px-5 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === tab
              ? "text-emerald-600 bg-emerald-50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}

          {/* Reviews badge */}
          {tab === "reviews" && derivedData?.ratings?.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
              {derivedData.ratings.length}
            </span>
          )}

          {/* Active indicator animation */}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
            />
          )}
        </button>
      ))}

    </div>
  </div>
</div>



        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <OverviewTab
                  mess={mess}
                  derivedData={derivedData}
                  onMapOpen={() => setIsMapOpen(true)}
                />
              )}

              {/* Menu Tab */}
              {activeTab === 'menu' && (
                <MenuTab menu={mess.menu} specialToday={mess.specialToday} />
              )}

              {/* Photos Tab */}
              {activeTab === 'photos' && (
                <PhotosTab
                  images={derivedData.images}
                  onImageClick={(index) => {
                    setCurrentImageIndex(index);
                    setImageModalOpen(true);
                  }}
                />
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <ReviewsTab
                  ratings={derivedData.ratings}
                  avgRating={derivedData.avgRating}
                  ratingDistribution={derivedData.ratingDistribution}
                  filteredReviews={filteredReviews}
                  reviewFilter={reviewFilter}
                  setReviewFilter={setReviewFilter}
                  showRatingForm={showRatingForm}
                  setShowRatingForm={setShowRatingForm}
                  rating={rating}
                  setRating={setRating}
                  comment={comment}
                  setComment={setComment}
                  isSubmitting={isSubmitting}
                  onSubmit={submitRatingHandler}
                />
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <LocationTab
                  mess={mess}
                  derivedData={derivedData}
                  onMapOpen={() => setIsMapOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Similar Messes */}
          {similarMesses.length > 0 && (
            <SimilarMesses messes={similarMesses} />
          )}
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <MobileCTA
        mess={mess}
        derivedData={derivedData}
      />

      <Footer />
    </div>
  );
};

export default MessDetails;


// Quick Stat Component
const QuickStat = ({ icon, label, value }) => (
  <div className="text-center p-3 bg-slate-50 rounded-xl">
    <div className="flex items-center justify-center text-emerald-600 mb-1">
      {icon}
    </div>
    <div className="text-sm font-semibold text-slate-900">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

// Share Menu Component
const ShareMenu = ({ isOpen, onClose, onShare, copiedLink }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
      >
        <div className="p-2">
          <button
            onClick={() => onShare('copy')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {copiedLink ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-sm font-medium">
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </span>
          </button>
          <button
            onClick={() => onShare('whatsapp')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
          <button
            onClick={() => onShare('twitter')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">𝕏</span>
            </div>
            <span className="text-sm font-medium">Twitter</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

// Overview Tab
const OverviewTab = ({ mess, derivedData, onMapOpen }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      {/* About */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-500" />
          About This Mess
        </h2>
        <p className="text-slate-600 leading-relaxed">
          {mess.description || 'A quality mess service offering hygienic and delicious meals. Our menu includes a variety of traditional and modern dishes prepared with fresh ingredients.'}
        </p>
      </section>

      {/* Highlights */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500" />
          Highlights
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: <Utensils />, label: 'Fresh Food Daily' },
            { icon: <Clock />, label: 'Flexible Timings' },
            { icon: <Shield />, label: 'Hygienic Kitchen' },
            { icon: <Users />, label: 'Home-like Food' },
            { icon: <Star />, label: 'Top Rated' },
            { icon: <TrendingUp />, label: 'Popular Choice' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="text-emerald-500">{item.icon}</div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value={mess.capacity || 'N/A'}
          label="Capacity"
          color="emerald"
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          value={derivedData.avgRating > 0 ? derivedData.avgRating.toFixed(1) : 'New'}
          label="Rating"
          color="yellow"
        />
        <StatCard
          icon={<MessageCircle className="w-6 h-6" />}
          value={derivedData.ratings.length}
          label="Reviews"
          color="blue"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          value={mess.type || 'Mixed'}
          label="Type"
          color="purple"
        />
      </section>
    </div>

    {/* Sidebar */}
    <div className="space-y-6">
      {/* Location Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Location
        </h3>
        <p className="text-slate-600 text-sm mb-4">{derivedData.displayAddress}</p>
        <button
          onClick={onMapOpen}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          View on Map
        </button>
      </div>

      {/* Timings Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          Meal Timings
        </h3>
        <div className="space-y-3">
          {[
            { meal: 'Breakfast', time: '7:30 AM - 9:30 AM' },
            { meal: 'Lunch', time: '12:30 PM - 2:30 PM' },
            { meal: 'Dinner', time: '7:30 PM - 9:30 PM' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-700 font-medium">{item.meal}</span>
              <span className="text-slate-500 text-sm">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Stat Card
const StatCard = ({ icon, value, label, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
      <div className={`inline-flex p-3 rounded-xl ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
};

// Menu Tab
const MenuTab = ({ menu, specialToday }) => (
  <div className="space-y-8">
    {specialToday && (specialToday.lunch || specialToday.dinner) && (
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Today's Special
        </h2>
        <SpecialToday special={specialToday} />
      </section>
    )}

    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
        Weekly Menu
      </h2>
      <MenuSection menu={menu} />
    </section>
  </div>
);

// Photos Tab
const PhotosTab = ({ images, onImageClick }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
      <Camera className="w-5 h-5 text-emerald-500" />
      Gallery ({images.length} photos)
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onImageClick(idx)}
          className="relative aspect-square rounded-2xl overflow-hidden group"
        >
          <img
            src={img}
            alt={`Photo ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </button>
      ))}
    </div>
  </div>
);

// Reviews Tab
const ReviewsTab = ({
  ratings, avgRating, ratingDistribution, filteredReviews,
  reviewFilter, setReviewFilter, showRatingForm, setShowRatingForm,
  rating, setRating, comment, setComment, isSubmitting, onSubmit
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Rating Summary */}
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-slate-900 mb-2">
            {avgRating > 0 ? avgRating.toFixed(1) : '-'}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(avgRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">Based on {ratings.length} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 mb-6">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <button
              key={star}
              onClick={() => setReviewFilter(reviewFilter === star.toString() ? 'all' : star.toString())}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                reviewFilter === star.toString() ? 'bg-emerald-50' : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-sm text-slate-600 w-8">{star} ★</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 w-8">{count}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowRatingForm(true)}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Write a Review
        </button>
      </div>
    </div>

    {/* Reviews List */}
    <div className="lg:col-span-2 space-y-6">
      {/* Write Review Form */}
      <AnimatePresence>
        {showRatingForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Write Your Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-200 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                placeholder="Share your experience with this mess..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !rating}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowRatingForm(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      {reviewFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            Showing {reviewFilter}-star reviews
          </span>
          <button
            onClick={() => setReviewFilter('all')}
            className="text-sm text-emerald-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Review Card
const ReviewCard = ({ review }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
        {getInitials(review.studentName)}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-slate-900">{review.studentName || 'Anonymous'}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.stars
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{getTimeAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>
        {review.comment && (
          <p className="text-slate-600 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  </div>
);

// Location Tab
const LocationTab = ({ mess, derivedData, onMapOpen }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-emerald-500" />
        Address Details
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-500">Full Address</label>
          <p className="text-slate-700 font-medium">{derivedData.displayAddress}</p>
        </div>
        
        {mess.district && (
          <div>
            <label className="text-sm text-slate-500">District</label>
            <p className="text-slate-700 font-medium">{mess.district}</p>
          </div>
        )}
        
        {mess.state && (
          <div>
            <label className="text-sm text-slate-500">State</label>
            <p className="text-slate-700 font-medium">{mess.state}</p>
          </div>
        )}
        
        {mess.pincode && (
          <div>
            <label className="text-sm text-slate-500">Pincode</label>
            <p className="text-slate-700 font-medium">{mess.pincode}</p>
          </div>
        )}
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
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Google Maps
        </a>
      </div>
    </div>

    <div className="bg-slate-200 rounded-2xl h-80 lg:h-auto overflow-hidden">
      {/* Placeholder for map embed */}
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <button
          onClick={onMapOpen}
          className="flex flex-col items-center gap-3 text-slate-500"
        >
          <MapPin className="w-12 h-12" />
          <span className="font-medium">Click to view map</span>
        </button>
      </div>
    </div>
  </div>
);

// Similar Messes
const SimilarMesses = ({ messes }) => (
  <section className="mt-12">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Messes</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {messes.map((mess) => (
        <Link
          key={mess._id}
          to={`/mess/${mess._id}`}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <div className="aspect-[4/3] bg-slate-100">
            <img
              src={mess.images?.[0] || 'https://via.placeholder.com/300'}
              alt={mess.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-1 truncate">{mess.title}</h3>
            <p className="text-sm text-slate-500 mb-2 truncate">{mess.location}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-600">{formatPrice(mess.price)}/mo</span>
              {mess.averageRating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
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

// Mobile CTA
const MobileCTA = ({ mess, derivedData }) => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="text-xl font-bold text-emerald-600">{formatPrice(mess.price)}</div>
        <div className="text-xs text-slate-500">per month</div>
      </div>
      <button
        onClick={() => derivedData.contactNumber && (window.location.href = `tel:${derivedData.contactNumber}`)}
        disabled={!derivedData.contactNumber}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed ${
          derivedData.contactNumber
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 text-slate-500 '
        }`}
      >
        <Phone className="w-5 h-5" />
        Call Now
      </button>
    </div>
  </div>
);

// Image Gallery Modal
const ImageGalleryModal = ({ isOpen, onClose, images, currentIndex, onNavigate, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
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

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navigation */}
      <button
        onClick={() => onNavigate('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => onNavigate('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Thumbnails */}
      <div className="p-4 flex items-center justify-center gap-2 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx > currentIndex ? 'next' : 'prev')}
            className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
              idx === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-75'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="h-16 bg-white border-b border-slate-200" />
    
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/2 animate-pulse" />
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error State
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Mess Not Found</h2>
      <p className="text-slate-500 mb-6">{error || 'The mess you are looking for does not exist or has been removed.'}</p>
      <div className="flex items-center justify-center gap-4">
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