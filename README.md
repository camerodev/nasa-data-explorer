# NASA Data Explorer
A full-stack web application to explore data from NASA's public APIs, including Astronomy Picture of the Day (APOD), Mars Rover Photos, Near Earth Objects (NEO) data, and NASA Image/Video Library.
## Tech Stack
### Backend
- Node.js + Express
- Axios for NASA API requests
- express-rate-limit for API rate limiting
- Helmet + CORS for security
- Compression for performance
### Frontend
- React + Vite
- React Query for data fetching and caching
- Material UI for UI components
- Lightbox for image viewing
## Getting Started
### 1. Clone the Repository
```
git clone https://github.com/camerodev/nasa-data-explorer.git
cd nasa-data-explorer
```
### 2. Backend Setup
```
cd backend
npm install
```
- Create a .env file
```
NASA_API_KEY=your_nasa_api_key
PORT=5000
```
- Start the backend:
```
npm run dev
```
### 3. Frontend Setup
```
cd ../frontend
npm install
```
- Create a .env file
```
VITE_API_BASE_URL=http://localhost:5000/api
```
- Start the frontend:
```
npm run dev
```
## Planned Features
- User Authentication
- Mobile Optimization: Further improve responsiveness for small devices.
- Backend Tests: Add unit and integration tests for reliability.

