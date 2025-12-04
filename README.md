Zip Nivasa — Find.Connect.Live (Accommodation, Mess, Laundry & Services centrelized Platform)

Zip Nivasa is an all-in-one centralized platform designed to help students and working professionals find, connect, and live with ease.
It unifies PG accommodations, mess services, laundry, real-time chat, reviews, maps, and owner dashboards into a single seamless ecosystem. Built using modern MERN technologies with Spring Boot migration support, Zip Nivasa delivers a complete real-world experience for both tenants and service providers.

About the Project

Students arriving in new cities struggle with:

Finding reliable PG accommodations

Checking food (mess) quality

Contacting PG/Mess owners

Comparing amenities, prices, and locations

Finding nearby laundry and services

Zip Nivasa solves all these problems in a single platform using modern, scalable technology.

Tech Stack
Frontend

React.js (Vite)

TailwindCSS

React Router

Leaflet Maps

Backend

Node.js + Express

MongoDB + Mongoose

Socket.io (Real-time messaging)

Geolocation

Leaflet Maps

OpenCage Geocode

Mappls Integration (fallback-ready)

Spring Boot Migration (Ready)

Spring Security

Lombok

JWT Auth

Spring Data MongoDB

⭐ Key Features
🔹 PG–Tenant Features

PG listing with images, price, amenities, ratings

Filters: price, distance, amenities, occupancy type

PG Owner Dashboard

Structured addresses with lat/lng geocoding

Review & rating system

Inquiry & contact system

Image slider like Airbnb

Distance-based sorting

🔹 Mess System

Daily menu + today’s special

Mess owner dashboard

Publish Lunch/Dinner special

Auto-reset specials via CRON at midnight

Menu images

Rating system

🔹 Laundry Services

Laundry listing

Price details

Easy contact options

💬 Real-Time Chat System (WhatsApp-like)

Built using Socket.io + MongoDB:

Instant 1-to-1 message delivery

Typing indicators

Online/Offline status

Delivered + Read receipts (✓ / ✓✓)

Optimistic UI for fast feel

Conversation list with unread count

Auto "mark as read"

Live read receipts (message_read event)

🗺️ Mapping & Geolocation Features

Using Leaflet + OpenCage:

PG Near Me (auto detect location)

Radius search (1–20 km)

Live map markers for PGs

Distance-based sorting

Map popups with images & price

Structured address → geocode stored in DB

Mappls support planned

Future-ready for POI (gyms, ATMs, hospitals)

📦 Modules Overview
Authentication

JWT Login/Signup

Role-based access: tenant, pgowner, messowner, laundry

Secure password hashing

PG Module

Add/Update/Delete PG

Multiple image uploads

Amenities list

Geo-enabled listing

Reviews + ratings

Mess Module

Mess listing

Today’s special

Images, ratings, menu

Owner dashboard

Laundry Module

Service listing

Contact & pricing

Chat Module

Real-time messaging

Mark-as-read

Conversation summaries

Optimistic message rendering

Utility Module

Pincode → Address helper

Address parser

Geocode utilities

📚 API Structure
Auth Routes
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/user/:id

PG Routes
GET    /api/pgs/all
GET    /api/pgs/:id
POST   /api/pgs/create
PATCH  /api/pgs/update/:id
DELETE /api/pgs/delete/:id

Chat Routes
POST /api/chat/send
POST /api/chat/mark-read
GET  /api/chat/history/:userId
GET  /api/chat/conversations

Mess Routes
POST /api/mess/create
POST /api/mess/special
GET  /api/mess/:id

Folder Structure
zip-nivasa/
 ├── backend/
 │    ├── controllers/
 │    ├── routes/
 │    ├── models/
 │    ├── middleware/
 │    ├── utils/
 │    ├── server.js
 │    └── config/db.js
 │
 └── frontend/
      ├── src/
      │    ├── pages/
      │    ├── components/
      │    ├── services/
      │    ├── layouts/
      │    └── App.jsx
      └── index.html

⚙️ Installation Guide
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

🔑 Environment Variables

Create a .env file:

MONGO_URI=
JWT_SECRET=
MAPPLS_REST_KEY=
OPENCAGE_API_KEY=

🚀 Future Enhancements

In-app calling using WebRTC

Media upload in chat

Push notifications

AI-based PG recommendation engine

Payment gateway integration

Owner analytics dashboard

Heatmap view for PG density
Conclusion

Zip Nivasa is a fully functional, real-world accommodation ecosystem featuring:

PG Listings

Mess & Laundry Services

Real-time Chat

Map-based PG discovery

Multi-role dashboards

Clean UI + Animations
