import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './components/Map';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pins`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch pins: ${response.status} ${response.statusText}\n${errorText}`);
        }
        const data = await response.json();
        // Transform the data to match the expected format
        const transformedPins = data.map(pin => ({
          id: pin._id,
          coordinates: pin.coordinates,
          image: pin.image,
          title: pin.title,
          description: pin.description,
          google: pin.bookurl,
          direction: pin.direction,
          website: pin.learnmore,
          icon: pin.icon
        }));
        setPins(transformedPins);
      } catch (err) {
        console.error('Error fetching pins:', err);
        setError(err.message || 'Failed to connect to the server. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, []);

  // Function to handle navigation and map re-render
  const handleNavigation = () => {
    setMapKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ 
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#4b5563' }}>Loading pins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ 
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>Error loading pins</h2>
          <p style={{ color: '#4b5563' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map key={mapKey} pins={pins} setPins={setPins} />} />
        <Route path="/admin-dashboard" element={<Dashboard pins={pins} setPins={setPins} />} />
      </Routes>
    </Router>
  );
}

export default App;
