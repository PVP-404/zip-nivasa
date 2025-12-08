Zip Nivasa  — Find. Connect. Live.

Your All-in-One Accommodation, Mess & Essential Services Platform
Zip Nivasa is a unified platform designed for students, working professionals, PG owners, mess providers, and laundry owners.
It helps users find PGs, book mess services, chat with owners, explore locations on the map, and manage their stay — all in one place.

⭐ Tagline

Find. Connect. Live. - 
Because finding the right place to stay should be simple, fast, and stress-free.

🚀 Features Overview
 
 Tenants
 
    1) Browse PGs across locations in India
    2) Advanced filters: budget, furnishing, type, gender-specific PGs
    3) High-quality photos, amenities, ratings, reviews
    4) Mess booking with daily/weekly/monthly plans
    5) Real-time chat with PG owners and mess owners
    6) “PG Near Me” with geolocation + Mappls Maps
    7) View PG on interactive Leaflet map
    8) Explore surroundings: colleges, ATMs, hospitals, etc.
    9) Get distance from your current location
    10) Push notifications for messages and alerts
    11) Secure login with JWT
    12)Smooth animated UI (Framer Motion)


 PG Owners

    1) Add listings with structured data
    2) Step-by-step listing wizard
    3) Upload photos (Cloudinary-ready)
    4) Address validation via OpenCage & Mappls eLoc
    5) Real-time chat with students
    6) Notifications when someone messages or inquiry
    7) Owner dashboard.
    8) Manage reviews and visibility


Mess Owners

    1) Add mess listings
    2) Plan-wise pricing
    3) Publish daily specials
    5) Chat with customers
    6) Real-time update notifications

Laundry Services

    1) Basic laundry service module
    2) Order placement
    3) Service tracking
    4) Owner-side dashboard


📍 Maps, Geolocation & Autosuggest

Integrated using Mappls (MapmyIndia) + OpenCage Geocoding.

🔹 Features:

    1) Autosuggest while typing address
    2) Convert address → lat/lng automatically
    3) Get eLoc codes
    4) “PG Near Me” using user’s geolocation
    5) Show PG on Leaflet interactive map
    6) Distance calculation between user & PG
    7) Surroundings search like banks, ATMs, hospitals
    8) Open in Mappls navigation

🔔 Notifications + FCM (Firebase Cloud Messaging)
   How FCM Works in This Project

    1) Browser requests FCM token using requestFCMToken().
    2) Token stored in user model (fcmTokens array, stores last 5).
    3) Server pushes notifications via Firebase Admin SDK using notifyNewMessage().
    4) User receives:
      a) New message notifications
    5) Header shows real-time unread count
    6) Tokens deregistered on logout (deregisterTokenWithBackend)


💬 Real-Time Chat System
   Built using Socket.IO + REST Fallback.

✔ Features:
   1) Typing indicators
   2) Read receipts
   3) Online/offline detection
   4) Auto load last 50 messages
   5) Message encryption-ready architecture
   6) Mark-read route /api/chat/mark-read
   7) Fallback REST when sockets fail

Message Schema Improvements
   1) Sender
   2) Receiver
   3) Message
   4) Attachments (Cloudinary)
   5) ReadAt timestamp
   6) DeliveredAt timestamp
   7) Conversation ID
   8) Indexes for performance

🧭 PG Near Me

    1) Uses browser geolocation
    2) Auto-fetch nearest PGs within X KM radius
    3) Uses Haversine formula for distance
    4) Map view + list view
    5) Real-time filter update

🗂 Backend (Node.js + Express)
Includes:

    1) Auth (JWT)
    2) Role-based access: student, pgowner, messowner, laundry
    3) PG routes:
       /api/pg/add
       /api/pg/search
       /api/pg/nearby
    4) Mess routes
    5) Laundry routes
    6) Chat routes
    7) Notification routes
    8) FCM token management
    9) Profile routes
    10) MongoDB Atlas-ready connection

🔐 Authentication & Security

    1) JWT Auth
    2) Middleware-based route protection
    3) Password hashing
    4) Owner verification
    5) FCM token validation
    6) Rate limiting upcoming

✨ UI/UX Highlights

    1) Fully animated using Framer Motion
    2) Emerald + Mint theme
    3) Glassmorphism cards
    4) Sticky sidebar
    5) Smooth scrolling
    6) Skeleton loaders
    7) Responsive, mobile-first layout
    8) Modern typography & icons


Folder Structure (Frontend)

    /frontend
      /src
        /components
        /layouts
        /services
        /pages
        /context
        /hooks
        /utils
        /assets


Folder Structure (Backend)

    /backend
      /controllers
        /routes
        /models
       /config
       /middlewares
       /utils
     server.js


🛠 Tech Stack

Frontend

1) React.js
2) Vite
3) TailwindCSS
4) Framer Motion
5) Leaflet Maps
6) Axios

Backend

1) Node.js
2) Express.js
3) MongoDB / MongoDB Atlas
4) Socket.IO
5) Firebase Admin SDK
6) Mappls APIs
7) Cloudinary (file uploads)

🧪 APIs Used

  1) Mappls (MapmyIndia) APIs
     
     a) Autosuggest
     
     b) Forward geocoding
     
     c) Reverse geocoding
     
     d) eLoc retrieval
     
     f) Nearby places

  3) OpenCage
     
       a) Structured address → lat/lng

  5) Firebase
     
       a) FCM

🌐 Environment Variables

MONGO_URI=

JWT_SECRET=

MAPPLS_CLIENT_ID=

MAPPLS_CLIENT_SECRET=

OPENCAGE_API_KEY=

FIREBASE_PROJECT_ID=

FIREBASE_CLIENT_EMAIL=

FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

Made with ❤️ for students and city movers — Zip Nivasa helps you Find. Connect. Live.
