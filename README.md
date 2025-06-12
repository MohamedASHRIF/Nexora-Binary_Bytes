# Nexora Campus Copilot

## Project Overview
Nexora Campus Copilot is an intelligent AI-powered campus assistant designed to enhance the university experience for students, staff, and administrators. The application provides real-time information about class schedules, bus timings, campus events, cafeteria menus, and interactive campus navigation. Built with modern web technologies, it offers a seamless, multilingual interface with voice interaction capabilities and personalized user experiences.

## Features

### Core Features
- **Intelligent Chat Interface**: AI-powered chatbot with natural language processing for campus-related queries
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
- **Daily Prompt Tracking**: Intelligent prompt history management with date-based organization
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
*Screenshots and demo videos can be added here to showcase the application's interface and functionality.*

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

### Backend Setup
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
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora-campus
JWT_SECRET=your_jwt_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NODE_ENV=development
```

## Team
- **Mohamed Ashrif** – Full Stack Developer & Project Lead
- **Dilumika** – Backend Developer & Database Architect
- **Roshani** – Frontend Developer & UI/UX Designer

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support and questions, please contact the development team or create an issue in the repository.

## Project Structure

```
nexora-campus-copilot/
├── app/
│   ├── data/           # Mock data files
│   └── page.tsx        # Main page component
├── components/         # React components
├── hooks/             # Custom React hooks
├── public/            # Static assets
└── styles/            # Global styles
```

## Acknowledgments

- NovaCore University for the inspiration
- The hackathon team for their dedication
- All contributors who help improve the project