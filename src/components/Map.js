import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token from environment variable
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Debug token
console.log('Token available:', !!MAPBOX_TOKEN);
console.log('Token length:', MAPBOX_TOKEN?.length);
console.log('Token prefix:', MAPBOX_TOKEN?.substring(0, 10));

mapboxgl.accessToken = MAPBOX_TOKEN;

const Map = ({ pins }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [styleData, setStyleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const markerRefs = useRef({});

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is missing');
      return;
    }

    const loadMapResources = async () => {
      try {
        // Preload the style data
        const styleResponse = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${MAPBOX_TOKEN}`);
        console.log('Style fetch response:', styleResponse.status, styleResponse.statusText);
        const styleData = await styleResponse.json();
        console.log('Style data received:', !!styleData);

        // Preload the sprite data
        const spriteUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/sprite?access_token=${MAPBOX_TOKEN}`;
        const spriteResponse = await fetch(spriteUrl);
        console.log('Sprite fetch response:', spriteResponse.status, spriteResponse.statusText);
        
        if (!spriteResponse.ok) {
          throw new Error('Failed to load sprite data');
        }

        // Modify the style data to use the preloaded sprite
        if (styleData.sprite) {
          styleData.sprite = spriteUrl;
        }

        setStyleData(styleData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map resources:', err);
        setError('Error loading map resources');
      }
    };

    loadMapResources();
  }, []);

  useEffect(() => {
    if (!styleData || map.current || isLoading) return;

    try {
      console.log('Initializing map with style data');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: styleData,
        center: [172.5, -41.5], // Center of New Zealand
        zoom: 5.5, // Adjusted zoom to show full country
        minZoom: 4, // Prevent zooming out too far
        maxZoom: 15, // Prevent zooming in too close
        attributionControl: true,
        transformRequest: (url, resourceType) => {
          console.log('Transform request:', { url, resourceType });
          if (url.includes('mapbox.com')) {
            const transformed = {
              url: url,
              headers: {
                'Accept': 'application/json',
                'Origin': window.location.origin,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              credentials: 'same-origin',
              mode: 'cors'
            };
            console.log('Transformed request:', transformed);
            return transformed;
          }
        }
      });

      // Add pins as markers
      markerRefs.current = {};
      pins.forEach(pin => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.background = selectedPin === pin.id ? '#dc2626' : '#1abc9c';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.innerText = pin.id;
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          setSelectedPin(pin.id);
          const infoEl = document.getElementById(`infowindow-${pin.id}`);
          if (infoEl) {
            infoEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        });
        const marker = new mapboxgl.Marker(el)
          .setLngLat(pin.coordinates)
          .addTo(map.current);
        markerRefs.current[pin.id] = { marker, el };
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError(e.error?.message || 'Error loading map');
      });

      // Add load handler
      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      // Add style loading handler
      map.current.on('style.load', () => {
        console.log('Style loaded successfully');
      });

      // Add style error handler
      map.current.on('style.error', (e) => {
        console.error('Style error:', e);
        setError('Error loading map style');
      });

      // Add request handler
      map.current.on('request', (e) => {
        console.log('Request started:', e);
      });

      map.current.on('requestend', (e) => {
        console.log('Request ended:', e);
      });

      // Add source handler
      map.current.on('sourcedata', (e) => {
        console.log('Source data event:', e);
      });

      // Add source error handler
      map.current.on('sourcedataerror', (e) => {
        console.error('Source data error:', e);
      });

      // Clean up on unmount
      return () => map.current.remove();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message);
    }
  }, [styleData, isLoading]);

  // Update marker color when selectedPin changes
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, ref]) => {
      if (ref && ref.el) {
        ref.el.style.background = selectedPin == id ? '#dc2626' : '#1abc9c';
      }
    });
  }, [selectedPin]);

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
          <h2 style={{ color: '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>Error loading map</h2>
          <p style={{ color: '#4b5563' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
          <p style={{ color: '#4b5563' }}>Loading map resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      {/* Infowindows at the bottom */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        padding: '16px',
        background: 'rgba(255,255,255,0.85)',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.07)'
      }}>
        {pins.map(pin => (
          <div
            key={pin.id}
            id={`infowindow-${pin.id}`}
            style={{
              minWidth: 260,
              maxWidth: 260,
              borderRadius: 10,
              overflow: 'hidden',
              border: selectedPin === pin.id ? '3px solid #22c55e' : '2px dashed #22c55e',
              background: '#fff',
              boxShadow: selectedPin === pin.id ? '0 2px 12px #22c55e33' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s, border 0.2s',
              outline: selectedPin === pin.id ? '2px solid #22c55e' : 'none',
              position: 'relative',
            }}
            onClick={() => {
              setSelectedPin(pin.id);
              if (map.current) {
                map.current.flyTo({ center: pin.coordinates, zoom: 13 });
              }
            }}
          >
            {/* Number badge */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 32,
              height: 32,
              background: selectedPin === pin.id ? '#dc2626' : '#22c55e',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
              zIndex: 2
            }}>{pin.id}</div>
            <img src={pin.image} alt={pin.title} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
            <div style={{ padding: 10 }}>
              <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.1em' }}>{pin.title}</div>
              <div style={{ fontSize: '0.95em', margin: '6px 0' }} dangerouslySetInnerHTML={{ __html: pin.description }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <a href={pin.google} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#16a34a', color: '#fff', borderRadius: 4, padding: '6px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Book Now</a>
                <a href={pin.direction} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff', borderRadius: 4, padding: '6px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Direction</a>
                <a href={pin.website} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#dc2626', color: '#fff', borderRadius: 4, padding: '6px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Learn More</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add marker CSS
const style = document.createElement('style');
style.innerHTML = `
.custom-marker {
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
`;
document.head.appendChild(style);

export default Map; 