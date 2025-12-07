import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { X, MessageCircle, Bell } from "lucide-react";

function NotificationToast({ notif, onClose }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isNavigating) return;

    const timer = setTimeout(onClose, 5000);
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 2));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose, isNavigating]);

  useEffect(() => {
    if (isHovered && !isNavigating) {
      const timer = setTimeout(onClose, 10000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, isNavigating, onClose]);

 
  const handleToastClick = () => {
    if (!notif.chatUserId) return onClose();

    setIsNavigating(true);

    navigate(`/chat/${notif.chatUserId}`);

    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!notif) return null;

  const getIcon = () => {
    if (notif.chatUserId)
      return <MessageCircle className="w-5 h-5 text-indigo-500" />;
    return <Bell className="w-5 h-5 text-indigo-500" />;
  };

  return createPortal(
    <div
      className="fixed top-5 right-5 z-[9999] w-full max-w-sm animate-fadeIn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleToastClick}
        className="group relative bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-100 rounded-2xl p-5 
                  transition-all duration-300 overflow-hidden cursor-pointer
                  hover:bg-gray-50/50 active:scale-[0.98]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-t-2xl">
          <div
            className="h-full bg-indigo-400 rounded-t-2xl shadow-sm transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-1.5 -m-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white/80 
                     backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                     transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 pt-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 p-2.5 bg-emerald-100 rounded-2xl 
                           border border-emerald-200/50 shadow-sm flex items-center justify-center mt-0.5">
              {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
                {notif.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {notif.body}
              </p>
            </div>
          </div>

          {notif.chatUserId && (
            <Link
              to={`/chat/${notif.chatUserId}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="group/link w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-indigo-500
                         hover:bg-indigo-600 text-white py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg focus:outline-none 
                         focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              <span>Reply</span>
              <MessageCircle className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          top: 1rem !important;
          right: 1rem !important;
          max-w-sm: max-w-full;
        }
      `}</style>
    </div>,
    document.body
  );
}

export default NotificationToast;
