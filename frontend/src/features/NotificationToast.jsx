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
      className="fixed top-5 right-5 z-[9999] w-full max-w-sm transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleToastClick}
        className="group relative bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl border border-gray-100 rounded-2xl p-6 
                  transition-all duration-300 hover:-translate-y-1 focus-within:-translate-y-1 overflow-hidden cursor-pointer
                  hover:bg-indigo-50/50 active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-2xl -z-10" />

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-indigo-200/50 to-transparent rounded-t-2xl">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-t-2xl shadow-sm transition-all duration-100"
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
            <div className="flex-shrink-0 w-10 h-10 p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl 
                           border border-indigo-200/50 shadow-sm ring-1 ring-white/50 backdrop-blur-sm flex items-center justify-center mt-0.5">
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
              className="group/link w-full inline-flex items-center justify-center gap-2 text-sm font-semibold 
                         bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                         text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none 
                         focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 active:scale-[0.97]"
            >
              <span>Reply</span>
              <MessageCircle className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        .transition-all {
          animation: slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
