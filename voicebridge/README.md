# VoiceBridge | Full-Stack Production Setup

This is a professional full-stack implementation of the VoiceBridge Civic Governance Platform.

## 📁 Structure
- `/backend`: Node.js, Express, MongoDB Atlas
- `/frontend`: React.js, Vite, Tailwind CSS, Framer Motion

## 🚀 Setup Instructions

### 1. Backend Setup
1. Navigate to `voicebridge/backend`.
2. Run `npm install` to install dependencies.
3. Rename `.env.example` to `.env` and provide your **MongoDB Atlas URI** and a **JWT Secret**.
4. Run `npm run dev` to start the development server (requires nodemon) or `npm start`.

### 2. Frontend Setup
1. Navigate to `voicebridge/frontend`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and set `VITE_API_URL=http://localhost:5000/api`.
4. Run `npm run dev` to start the Vite development server.

## 🛠️ Features
- **Voice-First Input**: Uses Web Speech API for real-time citizen reporting.
- **REST API**: Secure endpoints for complaint creation, tracking, and administration.
- **Persistent Storage**: Real MongoDB integration (no mock data).
- **Admin Dashboard**: Full CRUD capabilities and status lifecycle management.
- **Futuristic UI**: Premium glassmorphic design system.

## 📱 Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Axios, Lucide
- **Backend**: Express.js, Mongoose, JWT, BcryptJS, CORS
- **Database**: MongoDB Atlas
