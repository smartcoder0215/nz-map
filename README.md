# New Zealand Map Application

An interactive map application showcasing locations across New Zealand with detailed information, booking capabilities, and a modern admin dashboard.

## Features

- Interactive map with custom overlay images
- **Click-to-place-pin:** Admins can add a pin by clicking on the map; the pin creation modal will open with coordinates pre-filled
- Location information cards with images, descriptions, and booking/direction links
- Infowindow (popup) for each pin, always positioned above the selected pin and fully visible
- Overlay image management (upload, activate, delete)
- Custom pin icons (upload and select)
- Admin dashboard for managing locations, overlays, and icons
- Responsive design for mobile and desktop

## Tech Stack

- Frontend: React.js with Mapbox GL
- Backend: Node.js with Express
- Database: MongoDB
- Deployment: Vercel (Frontend) and Railway (Backend)

## Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB database (local or Atlas)
- Mapbox account and access token
- Cloudinary account for image uploads
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
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
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

## Usage

- Visit `/admin-dashboard` to access the admin dashboard
- Use the "Place Pin on Map" button to add a pin by clicking on the map
- The pin creation modal will open with coordinates pre-filled
- Click any pin to open its infowindow; the map will center and zoom to the pin, and the infowindow will always be fully visible
- Manage overlay images and pin icons from the dashboard
- The map disables panning when the mouse is over the infowindow for better UX

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
