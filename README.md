# New Zealand Map Application

An interactive map application showcasing locations across New Zealand with detailed information and booking capabilities.

## Features

- Interactive map with custom markers
- Location information cards with images and descriptions
- Booking and direction links for each location
- Admin dashboard for managing locations
- Responsive design for mobile and desktop

## Tech Stack

- Frontend: React.js with Mapbox GL
- Backend: Node.js with Express
- Database: MongoDB
- Deployment: Vercel (Frontend) and Railway (Backend)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Mapbox account and access token
- Railway account for backend deployment
- Vercel account for frontend deployment

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-railway-app-url.railway.app
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## Local Development Setup

1. Clone the repository
```bash
git clone <repository-url>
cd map-newzealand
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the required environment variables

4. Start the development server
```bash
npm start
```

## Deployment

### Backend (Railway)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables:
   - `MONGODB_URI`
   - `PORT`
4. Railway will automatically deploy your backend
5. Copy the provided Railway URL

### Frontend (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Add environment variables:
   - `REACT_APP_API_URL` (Railway URL)
   - `REACT_APP_MAPBOX_TOKEN`
4. Vercel will automatically deploy your frontend

## Project Structure

```
map-newzealand/
├── public/
├── src/
│   ├── components/
│   │   ├── Map.js
│   │   └── Dashboard.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## API Endpoints

- `GET /api/pins` - Get all pins
- `POST /api/pins` - Create a new pin
- `PATCH /api/pins/:id` - Update a pin
- `DELETE /api/pins/:id` - Delete a pin

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
