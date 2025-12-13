// src/pages/pgs/PGDetails.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Bed,
  Shield,
  Wifi,
  Car,
  Utensils,
  Wind,
  Tv,
  Droplets,
  Zap,
  Lock,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2,
  ChevronDown,
  Navigation,
  Building2,
  IndianRupee,
  Eye,
  Flag,
  Maximize2,
  Info,
  ArrowRight,
  Bookmark,
  RefreshCw,
} from "lucide-react";

// Lazy load heavy components
const Header = lazy(() => import("../../components/Header"));
const Footer = lazy(() => import("../../components/Footer"));
const Sidebar = lazy(() => import("../../components/Sidebar"));
const PGMapModal = lazy(() => import("../../components/maps/PGMapModal"));

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============ Constants ============
const AMENITY_ICONS = {
  wifi: Wifi,
  "wi-fi": Wifi,
  parking: Car,
  food: Utensils,
  meals: Utensils,
  ac: Wind,
  "air conditioning": Wind,
  tv: Tv,
  television: Tv,
  water: Droplets,
  "hot water": Droplets,
  electricity: Zap,
  power: Zap,
  security: Lock,
  "24/7 security": Lock,
  laundry: Droplets,
  default: CheckCircle,
};

const PROPERTY_TYPES = {
  pg: { label: "Paying Guest", color: "indigo" },
  hostel: { label: "Hostel", color: "purple" },
  flat: { label: "Flat", color: "blue" },
  apartment: { label: "Apartment", color: "teal" },
  "co-living": { label: "Co-Living", color: "emerald" },
};

// ============ Utilities ============
const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatPrice = (price) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const getAmenityIcon = (amenity) => {
  const key = amenity?.toLowerCase().trim();
  for (const [match, Icon] of Object.entries(AMENITY_ICONS)) {
    if (key?.includes(match)) return Icon;
  }
  return AMENITY_ICONS.default;
};

const getPropertyTypeInfo = (type) => {
  const key = type?.toLowerCase().trim();
  return PROPERTY_TYPES[key] || { label: type || "PG", color: "gray" };
};

// ============ Custom Hooks ============
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      const valueToStore = typeof newValue === "function" ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error("LocalStorage error:", err);
    }
  }, [key, value]);

  return [value, setStoredValue];
};

const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
};

const usePGData = (id) => {
  const [data, setData] = useState({ pg: null, recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [pgRes, allRes] = await Promise.all([
        fetch(`${API}/api/pgs/${id}`),
        fetch(`${API}/api/pgs?limit=10`),
      ]);

      if (!pgRes.ok) throw new Error("Failed to fetch PG details");

      const pgData = await pgRes.json();
      const allData = await allRes.json();

      const pg = pgData.pg || pgData;
      const recommendations = (allData.pgs || allData || [])
        .filter((p) => p._id !== id)
        .slice(0, 4);

      setData({ pg, recommendations });
    } catch (err) {
      console.error("Error fetching PG:", err);
      setError(err.message || "Failed to load PG details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
};

// ============ Sub Components ============

// Loading Skeleton
const DetailsSkeleton = memo(() => (
  <div className="animate-pulse">
    {/* Breadcrumb Skeleton */}
    <div className="flex gap-2 mb-6">
      <div className="h-4 w-16 bg-gray-200 rounded" />
      <div className="h-4 w-4 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>

    {/* Title Skeleton */}
    <div className="mb-6">
      <div className="h-10 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="flex gap-4">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-28 bg-gray-200 rounded" />
      </div>
    </div>

    {/* Image Gallery Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      <div className="lg:col-span-3 h-[400px] bg-gray-200 rounded-2xl" />
      <div className="hidden lg:flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="h-7 w-48 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-2xl" />
    </div>
  </div>
));

DetailsSkeleton.displayName = "DetailsSkeleton";

// Error State
const ErrorState = memo(({ message, onRetry }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center px-6 max-w-md">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h2>
      <p className="text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white 
            font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          to="/dashboard/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 
            font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Browse PGs
        </Link>
      </div>
    </div>
  </div>
));

ErrorState.displayName = "ErrorState";

// Breadcrumb
const Breadcrumb = memo(({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex items-center gap-2 text-sm flex-wrap">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
));

Breadcrumb.displayName = "Breadcrumb";

// Star Rating
const StarRating = memo(({ rating = 0, count = 0, size = "md" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(rating)
                ? "text-amber-400 fill-amber-400"
                : i < rating
                ? "text-amber-400 fill-amber-400/50"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {count > 0 && (
        <span className="text-sm text-gray-500">({count} reviews)</span>
      )}
    </div>
  );
});

StarRating.displayName = "StarRating";

// Image Gallery
const ImageGallery = memo(({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const safeImages = useMemo(
    () => (images?.length > 0 ? images : ["/images/placeholder-pg.jpg"]),
    [images]
  );

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLightbox(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showLightbox, handlePrev, handleNext]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {/* Main Image */}
        <div className="lg:col-span-3 relative group">
          <div
            className="relative h-[300px] sm:h-[400px] lg:h-[450px] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setShowLightbox(true)}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            <img
              src={safeImages[selectedIndex]}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Navigation Arrows */}
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                    bg-white/90 shadow-lg flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                    bg-white/90 shadow-lg flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-lg shadow-lg
                flex items-center gap-2 text-sm font-medium text-gray-700
                opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
            >
              <Maximize2 className="w-4 h-4" />
              View Gallery
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 rounded-lg text-white text-sm">
              {selectedIndex + 1} / {safeImages.length}
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="hidden lg:flex flex-col gap-3">
            {safeImages.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-[calc((450px-3*12px)/4)] rounded-xl overflow-hidden border-2 transition-all",
                  selectedIndex === i
                    ? "border-indigo-500 ring-2 ring-indigo-200"
                    : "border-transparent hover:border-gray-300"
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedIndex === i && (
                  <div className="absolute inset-0 bg-indigo-500/10" />
                )}
              </button>
            ))}
            {safeImages.length > 4 && (
              <button
                onClick={() => setShowLightbox(true)}
                className="h-[calc((450px-3*12px)/4)] rounded-xl bg-gray-100 flex items-center justify-center
                  text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
              >
                +{safeImages.length - 4} more
              </button>
            )}
          </div>
        )}

        {/* Mobile Thumbnails */}
        {safeImages.length > 1 && (
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {safeImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  selectedIndex === i
                    ? "border-indigo-500"
                    : "border-transparent"
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={safeImages[selectedIndex]}
            alt={`${title} - Full Image ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        </div>
      )}
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

// Property Badge
const PropertyBadge = memo(({ type }) => {
  const info = getPropertyTypeInfo(type);
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700",
    emerald: "bg-emerald-100 text-emerald-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold",
        colorClasses[info.color]
      )}
    >
      <Building2 className="w-4 h-4" />
      {info.label}
    </span>
  );
});

PropertyBadge.displayName = "PropertyBadge";

// Amenity Item
const AmenityItem = memo(({ amenity }) => {
  const Icon = getAmenityIcon(amenity);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="p-2 bg-indigo-100 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">{amenity}</span>
    </div>
  );
});

AmenityItem.displayName = "AmenityItem";

// Specification Row
const SpecRow = memo(({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className={cn("font-semibold", highlight ? "text-indigo-600" : "text-gray-900")}>
      {value}
    </span>
  </div>
));

SpecRow.displayName = "SpecRow";

// Share Button
const ShareButton = memo(({ pg, address }) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out ${pg?.title} - ${formatPrice(pg?.monthlyRent)}/month at ${address}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pg?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share error:", err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  }, [pg?.title, shareText, shareUrl, showMenu]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  }, [shareUrl]);

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              Twitter
            </a>
          </div>
        </>
      )}
    </div>
  );
});

ShareButton.displayName = "ShareButton";

// Favorite Button
const FavoriteButton = memo(({ pgId }) => {
  const [favorites, setFavorites] = useLocalStorage("pgFavorites", []);
  const isFavorite = favorites.includes(pgId);

  const handleToggle = useCallback(() => {
    setFavorites((prev) =>
      prev.includes(pgId) ? prev.filter((id) => id !== pgId) : [...prev, pgId]
    );
  }, [pgId, setFavorites]);

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "p-2.5 rounded-xl transition-all",
        isFavorite
          ? "bg-red-50 text-red-500"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
    </button>
  );
});

FavoriteButton.displayName = "FavoriteButton";

// Contact Card
const ContactCard = memo(({ pg, onMapOpen }) => {
  const scrollY = useScrollPosition();
  const isSticky = scrollY > 200;

  return (
    <div className={cn("lg:sticky lg:top-6 space-y-4 transition-all", isSticky && "lg:top-4")}>
      {/* Price Card */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100">
        <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
        <p className="text-4xl font-bold text-gray-900 mb-1">
          {formatPrice(pg?.monthlyRent)}
        </p>
        <p className="text-sm text-gray-500">+ ₹{pg?.deposit?.toLocaleString() || "N/A"} deposit</p>

        {pg?.beds > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 font-medium">
              {pg.beds} {pg.beds === 1 ? "bed" : "beds"} available
            </span>
          </div>
        )}
      </div>

      {/* Contact Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-900 mb-4">Contact Owner</h3>

        {pg?.owner?.phone && (
          <>
            <a
              href={`tel:${pg.owner.phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 
                bg-emerald-500 text-white rounded-xl font-semibold
                hover:bg-emerald-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>

            <a
              href={`https://wa.me/${pg.owner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hi, I'm interested in ${pg.title}. Is it available?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 
                bg-green-500 text-white rounded-xl font-semibold
                hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </>
        )}

        <Link
          to={`/chat/${pg?.owner?._id}`}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 
            bg-indigo-600 text-white rounded-xl font-semibold
            hover:bg-indigo-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Chat In-App
        </Link>

        <button
          onClick={onMapOpen}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 
            bg-gray-100 text-gray-700 rounded-xl font-semibold
            hover:bg-gray-200 transition-colors"
        >
          <MapPin className="w-5 h-5" />
          View on Map
        </button>
      </div>

      {/* Trust Badges */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span>Verified Listing</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-5 h-5 text-indigo-500" />
          <span>Usually responds within 2 hours</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Eye className="w-5 h-5 text-amber-500" />
          <span>Viewed 24 times today</span>
        </div>
      </div>
    </div>
  );
});

ContactCard.displayName = "ContactCard";

// Recommendation Card
const RecommendationCard = memo(({ pg }) => (
  <Link
    to={`/services/pg/${pg._id}`}
    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden 
      hover:shadow-lg hover:border-gray-300 transition-all"
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={pg.images?.[0] || "/images/placeholder-pg.jpg"}
        alt={pg.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-lg shadow-sm">
        <span className="font-bold text-indigo-600 text-sm">
          {formatPrice(pg.monthlyRent)}
        </span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {pg.title}
      </h3>
      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
        <MapPin className="w-3.5 h-3.5" />
        {pg.location}
      </p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <PropertyBadge type={pg.propertyType} />
        <span className="text-indigo-600 text-sm font-medium flex items-center gap-1">
          View
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  </Link>
));

RecommendationCard.displayName = "RecommendationCard";

// ============ Main Component ============
const PGDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pg, recommendations, loading, error, refetch } = usePGData(id);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Computed values
  const displayAddress = useMemo(() => {
    if (!pg) return "";
    if (pg.mapplsAddress) return pg.mapplsAddress;
    if (pg.streetAddress && pg.district && pg.state) {
      return `${pg.streetAddress}, ${pg.district}, ${pg.state}${pg.pincode ? ` - ${pg.pincode}` : ""}`;
    }
    return pg.address || pg.location || "";
  }, [pg]);

  const mapplsEloc = pg?.mapplsEloc || pg?.eloc || null;
  const rating = pg?.rating || 4.5;

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "PGs", href: "/pgs/all" },
      { label: pg?.title || "Loading..." },
    ],
    [pg?.title]
  );

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Header onToggleSidebar={() => setIsSidebarOpen((s) => !s)} />
        </Suspense>
        <div className="flex">
          <Suspense fallback={null}>
            <Sidebar isOpen={isSidebarOpen} />
          </Suspense>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <DetailsSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !pg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Header onToggleSidebar={() => setIsSidebarOpen((s) => !s)} />
        </Suspense>
        <ErrorState message={error || "PG not found"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <Header onToggleSidebar={() => setIsSidebarOpen((s) => !s)} />
      </Suspense>

      <div className="flex">
        <Suspense fallback={null}>
          <Sidebar isOpen={isSidebarOpen} />
        </Suspense>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <PropertyBadge type={pg.propertyType} />
                  {pg.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {pg.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                  <StarRating rating={rating} count={pg.reviewCount} size="sm" />
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {pg.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-gray-400" />
                    {pg.beds || 0} Beds
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <ShareButton pg={pg} address={displayAddress} />
                <FavoriteButton pgId={id} />
                <button
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Report"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery images={pg.images} title={pg.title} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Location Card */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Location
                  </h2>
                  <p className="text-gray-700 mb-4">{displayAddress}</p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsMapOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white 
                        rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Map
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${pg.title} ${displayAddress}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 
                        rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                </section>

                {/* Description */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" />
                    About this Property
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {pg.description || "No description available."}
                  </p>
                </section>

                {/* Amenities */}
                {pg.amenities?.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                      Amenities & Facilities
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {pg.amenities.map((amenity, i) => (
                        <AmenityItem key={i} amenity={amenity} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Specifications */}
                <section className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Property Details
                  </h2>
                  <div className="divide-y divide-gray-100">
                    <SpecRow label="Property Type" value={pg.propertyType || "PG"} />
                    <SpecRow label="Occupancy Type" value={pg.occupancyType || "Sharing"} />
                    <SpecRow label="Available Beds" value={pg.beds || "N/A"} />
                    <SpecRow
                      label="Monthly Rent"
                      value={formatPrice(pg.monthlyRent)}
                      highlight
                    />
                    <SpecRow label="Security Deposit" value={formatPrice(pg.deposit)} />
                    {pg.maintenanceCharges && (
                      <SpecRow
                        label="Maintenance"
                        value={formatPrice(pg.maintenanceCharges)}
                      />
                    )}
                  </div>
                </section>

                {/* House Rules */}
                {pg.rules?.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      House Rules
                    </h2>
                    <ul className="space-y-2">
                      {pg.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Right Column - Contact */}
              <div className="lg:col-span-1">
                <ContactCard pg={pg} onMapOpen={() => setIsMapOpen(true)} />
              </div>
            </div>

            {/* Similar Properties */}
            {recommendations.length > 0 && (
              <section className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Similar Properties
                  </h2>
                  <Link
                    to="/pgs/all"
                    className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec._id} pg={rec} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <Suspense fallback={<div className="h-64 bg-gray-900" />}>
            <Footer />
          </Suspense>
        </main>
      </div>

      {/* Map Modal */}
      <Suspense fallback={null}>
        {isMapOpen && (
          <PGMapModal
            open={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            eloc={mapplsEloc}
            address={displayAddress}
            pg={pg}
          />
        )}
      </Suspense>
    </div>
  );
};

export default memo(PGDetails);