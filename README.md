# Nexora Campus Copilot

## Project Overview

Nexora Campus Copilot is a smart campus assistant designed to enhance the university experience for students, staff, and administrators. The application provides real-time information about class schedules, bus timings, campus events, cafeteria menus, and interactive campus navigation. Built with modern web technologies, it offers a seamless, multilingual interface with voice interaction capabilities and personalized user experiences.

## Features

### Core Features

- **Intelligent Chat Interface**: Rule-based chatbot with pattern matching for campus-related queries
- **Real-time Class Schedules**: Dynamic class schedule management with instructor and location details
- **Bus Route Management**: Live bus timing updates and route information for campus transportation
- **Event Management**: Comprehensive event tracking and management system for campus activities
- **Interactive Campus Map**: Google Maps integration with location-based services and navigation
- **Multilingual Support**: Full support for English, Sinhala (සිංහල), and Tamil (தமிழ்) languages
- **Voice Interaction**: Speech-to-text and text-to-speech capabilities for hands-free operation
- **User Authentication**: Secure role-based access control (Student, Staff, Admin)
- **Dark Mode**: Elegant dark blue theme with smooth transitions and user preference persistence

### Additional Features

- **Chat History**: Persistent conversation history with user-specific storage and search functionality
- **Daily Prompt Tracking**: Prompt history management with date-based organization
- **Admin Dashboard**: Comprehensive administrative interface for content management
- **Real-time Notifications**: Socket.io integration for live updates and notifications
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Data Insights**: Analytics and reporting features for campus activity monitoring
- **Game Points System**: Gamification elements with badges and achievement tracking
- **Offline Support**: Cached data functionality for improved performance

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Maps**: Google Maps API for campus navigation
- **State Management**: Zustand for client-side state
- **UI Components**: Radix UI, Lucide React icons
- **Development**: ESLint, Prettier, nodemon, ts-node

## Screenshots/Demo (Optional)

_Screenshots and demo videos can be added here to showcase the application's interface and functionality._

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Google Maps API key

### Frontend Setup

```bash
# Clone the repository
git clone <repo-url>
cd nexora-campus-copilot

# Install dependencies
npm install

# Create environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Backend Setup in Server Folder

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment variables
cp .env.example .env
# Edit .env with your configuration:
# - MONGODB_URI
# - JWT_SECRET
# - GOOGLE_MAPS_API_KEY

# Run development server
npm run dev
```

### Database Setup

```bash
# Start MongoDB service
mongod

# Create admin user (optional)
npm run create-admin

# Populate initial locations (optional)
npm run populate-locations
```

### Environment Variables

Create the following environment files:

**Frontend (.env.local):**

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCdvsWg1xTYr5VvR5-YiSkGmIMfLVX7lUU


**Server (.env):**

# Database Configuration
MONGODB_URI=mongodb+srv://mohamedashrif325:ashrif123@cluster0.dbgfuuf.mongodb.net/nexora-campus

# JWT Configuration
JWT_SECRET=nexora-campus-secret-key-2024
JWT_EXPIRES_IN=90d

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

## Test Users

You can use the following demo accounts to log in and test the application:

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@nexora.com     | admin123   |
| User  | ashrif@nexora.com    | ashrif123  |

## Team

- **Mohamed Ashrif** – Full Stack Developer & Project Lead
- **Nishmy** – Backend Developer & Database Architect
- **Muski** – Frontend Developer & UI/UX Designer
