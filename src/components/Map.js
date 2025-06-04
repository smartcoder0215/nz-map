import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token from environment variable
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Debug token
console.log('Token available:', !!MAPBOX_TOKEN);
console.log('Token length:', MAPBOX_TOKEN?.length);
console.log('Token prefix:', MAPBOX_TOKEN?.substring(0, 10));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Pin icons configuration
const PIN_ICONS = {
  attraction: '/pin-icons/attraction.png',
  activity: '/pin-icons/activity.png',
  culture: '/pin-icons/culture.png',
  hotel: '/pin-icons/hotel.png',
  nature: '/pin-icons/nature.png',
  restaurant: '/pin-icons/restaurant.png',
  shopping: '/pin-icons/shopping.png',
};

// Utility: Convert pixel to lng/lat based on overlay bounds
function pixelToLngLat(x, y, imageWidth, imageHeight, bounds) {
  // bounds: [SW, SE, NE, NW]
  const [sw, se, ne, nw] = bounds;
  const minLng = sw[0];
  const maxLng = se[0];
  const minLat = se[1];
  const maxLat = ne[1];
  const lng = minLng + (x / imageWidth) * (maxLng - minLng);
  const lat = maxLat - (y / imageHeight) * (maxLat - minLat);
  return [lng, lat];
}

const Map = ({ pins, setPins, onMapClickForPin, isPlacingPin }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const markerRefs = useRef({});
  const [infoWindowPosition, setInfoWindowPosition] = useState({ x: 0, y: 0 });
  const infoWindowRef = useRef(null);
  const [infoWindowHeight, setInfoWindowHeight] = useState(0);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [uploadedIcons, setUploadedIcons] = useState([]);

  // Fetch uploaded pin icons
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pin-icons`);
        const data = await res.json();
        setUploadedIcons(data);
      } catch (err) {
        setUploadedIcons([]);
      }
    };
    fetchIcons();
  }, []);

  // Fetch active overlay image
  useEffect(() => {
    const fetchActiveOverlay = async () => {
      try {
        console.log('Fetching overlay images...');
        const response = await fetch(`${API_URL}/api/overlay-images`);
        if (!response.ok) throw new Error('Failed to fetch overlay images');
        const images = await response.json();
        console.log('Fetched images:', images);
        const active = images.find(img => img.isActive);
        console.log('Active overlay:', active);
        if (active) {
          setActiveOverlay(active);
        }
      } catch (error) {
        console.error('Error fetching overlay:', error);
      }
    };

    fetchActiveOverlay();
  }, []);

  // Cleanup function to remove map and markers
  const cleanupMap = () => {
    if (map.current) {
      // Remove all markers
      Object.values(markerRefs.current).forEach(({ marker }) => {
        if (marker) {
          marker.remove();
        }
      });
      markerRefs.current = {};

      // Remove the map
      map.current.remove();
      map.current = null;
    }
  };

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is missing');
      return;
    }

    cleanupMap();

    console.log('Initializing map...');
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Create a blank style
    const blankStyle = {
      version: 8,
      sources: {},
      layers: []
    };

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: blankStyle,
        center: [174.7762, -41.2866], // Wellington coordinates
        zoom: 5,
        minZoom: 3,
        maxZoom: 15,
        attributionControl: true,
        bearing: 0,
        pitch: 0,
      });

      map.current.on('load', () => {
        console.log('Map loaded, active overlay:', activeOverlay);
        // Add overlay image if active
        if (activeOverlay) {
          console.log('Adding overlay source:', activeOverlay.url);
          try {
            map.current.addSource('overlay', {
              type: 'image',
              url: activeOverlay.url,
              coordinates: [
                [166.0, -34.0], // Southwest coordinates
                [178.0, -34.0], // Southeast coordinates
                [178.0, -47.0], // Northeast coordinates
                [166.0, -47.0]  // Northwest coordinates
              ]
            });

            console.log('Adding overlay layer');
            map.current.addLayer({
              id: 'overlay-layer',
              type: 'raster',
              source: 'overlay',
              paint: {
                'raster-opacity': 1
              }
            });

            // Disable map rotation
            map.current.dragRotate.disable();
            map.current.touchZoomRotate.disableRotation();

            // Fit bounds to show the entire overlay
            map.current.fitBounds(
              [
                [166.0, -47.0], // Southwest
                [178.0, -34.0]  // Northeast
              ],
              {
                padding: 50,
                maxZoom: 7
              }
            );
            console.log('Overlay added successfully');
          } catch (error) {
            console.error('Error adding overlay:', error);
          }
        }

        // Add pins as markers
        markerRefs.current = {};
        pins.forEach((pin, index) => {
          // Clean marker rendering: only the image as the marker element
          const img = document.createElement('img');
          const fallbackIcon = uploadedIcons[0] ? uploadedIcons[0].url : '';
          const isValidUrl = typeof pin.icon === 'string' && pin.icon.startsWith('http');
          img.src = isValidUrl ? pin.icon : fallbackIcon;
          img.style.width = '36px';
          img.style.height = '44px';
          img.style.objectFit = 'contain';
          img.style.display = 'block';
          img.onerror = () => { img.src = fallbackIcon; };
          // Attach click handler to marker image
          img.style.cursor = 'pointer';
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelectedPin(pin.id);
            updateInfoWindowPosition(pin.coordinates);
            if (map.current) {
              map.current.easeTo({
                center: pin.coordinates,
                zoom: 7,
                duration: 1000
              });
            }
          });
          // Highlight selected marker
          if (selectedPin === pin.id) {
            img.style.filter = 'drop-shadow(0 0 4px rgba(220, 38, 38, 0.8))';
          } else {
            img.style.filter = 'none';
          }
          const marker = new mapboxgl.Marker({
            element: img,
            anchor: 'bottom',
            offset: [0, 0]
          })
            .setLngLat(pin.coordinates)
            .addTo(map.current);
          markerRefs.current[pin.id] = { marker, el: img };
        });

        // Click-to-place-pin handler
        map.current.on('click', (e) => {
          if (isPlacingPin && typeof onMapClickForPin === 'function') {
            onMapClickForPin([e.lngLat.lng, e.lngLat.lat]);
          }
        });
      });

      // Add error handler
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      // Cleanup on unmount
      return () => {
        cleanupMap();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message);
    }
  }, [pins, activeOverlay, uploadedIcons, onMapClickForPin, isPlacingPin]);

  // Update marker when selectedPin changes
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, ref]) => {
      if (ref && ref.el) {
        const img = ref.el.querySelector('img');
        if (img) {
          // Add a highlight effect for selected pin
          img.style.filter = selectedPin == id ? 'drop-shadow(0 0 4px rgba(220, 38, 38, 0.8))' : 'none';
        }
      }
    });
  }, [selectedPin]);

  // Function to update infowindow position
  const updateInfoWindowPosition = (coordinates, customHeight) => {
    if (!map.current) return;
    const point = map.current.project(coordinates);
    const height = customHeight !== undefined ? customHeight : infoWindowHeight || 170;
    setInfoWindowPosition({
      x: point.x,
      y: point.y - height - 20 // 20px for arrow and gap
    });
  };

  // Measure infowindow height after render
  useLayoutEffect(() => {
    if (infoWindowRef.current && selectedPin) {
      const height = infoWindowRef.current.offsetHeight;
      setInfoWindowHeight(height);
      // Update position with new height
      const pinData = pins.find(pin => pin.id === selectedPin);
      if (pinData) {
        updateInfoWindowPosition(pinData.coordinates, height);
      }
    }
    // eslint-disable-next-line
  }, [selectedPin, pins]);

  // Update infowindow position when selectedPin changes
  useEffect(() => {
    if (!map.current || !selectedPin) return;
    
    const selectedPinData = pins.find(pin => pin.id === selectedPin);
    if (selectedPinData) {
      updateInfoWindowPosition(selectedPinData.coordinates);
    }
  }, [selectedPin, pins]);

  // Update infowindow position when map moves
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !selectedPin) return;

    const onMove = () => {
      const selectedPinData = pins.find(pin => pin.id === selectedPin);
      if (selectedPinData) {
        updateInfoWindowPosition(selectedPinData.coordinates);
      }
    };

    mapInstance.on('move', onMove);
    return () => {
      if (mapInstance) {
        mapInstance.off('move', onMove);
      }
    };
  }, [selectedPin, pins]);

  // Update marker click handler
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const cleanup = () => {
      Object.entries(markerRefs.current).forEach(([id, ref]) => {
        if (ref && ref.el) {
          const newEl = ref.el.cloneNode(true);
          ref.el.parentNode.replaceChild(newEl, ref.el);
          ref.el = newEl;
        }
      });
    };

    // Clean up existing handlers
    cleanup();

    // Add new click handlers
    Object.entries(markerRefs.current).forEach(([id, ref]) => {
      if (ref && ref.el) {
        ref.el.addEventListener('click', () => {
          const pinData = pins.find(pin => pin.id === id);
          if (pinData) {
            updateInfoWindowPosition(pinData.coordinates);
            setSelectedPin(id);
          }
        });
      }
    });

    return cleanup;
  }, [pins]);

  // Close infowindow when clicking outside
  useEffect(() => {
    if (!selectedPin) return;
    const handleClick = (e) => {
      if (infoWindowRef.current && !infoWindowRef.current.contains(e.target)) {
        setSelectedPin(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedPin]);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    pins.forEach(pin => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundImage = `url(${pin.image})`;
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat(pin.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3>${pin.title}</h3>
              <p>${pin.description}</p>
              ${pin.bookurl ? `<a href="${pin.bookurl}" target="_blank">Book Now</a>` : ''}
              ${pin.direction ? `<a href="${pin.direction}" target="_blank">Get Directions</a>` : ''}
              ${pin.website ? `<a href="${pin.website}" target="_blank">Learn More</a>` : ''}
            `)
        )
        .addTo(map.current);
    });
  }, [pins]);

  useEffect(() => {
    if (!map.current) return;
    const container = map.current.getContainer();
    if (isPlacingPin) {
      container.style.cursor = 'default'; // Arrow
    } else {
      container.style.cursor = '';
    }
  }, [isPlacingPin]);

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

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Top-center banner image with fade-in */}
      <img
        src="/banner.png" // Replace with your actual banner image path
        alt="Banner"
        onLoad={() => setBannerLoaded(true)}
        style={{
          position: 'absolute',
          // top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: 560,
          maxWidth: '90vw',
          pointerEvents: 'none',
          opacity: bannerLoaded ? 1 : 0,
          transition: 'opacity 1s ease',
          borderRadius: '20px',
          border: '1.5px solid rgba(255,255,255,0.10)',
          boxShadow: '0 12px 48px 0 rgba(0,0,0,0.35)'
        }}
      />
      <div ref={mapContainer} style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        top: 0, 
        left: 0,
        backgroundColor: '#e6c495'  // Add the background color
      }} />
      {/* Single sticky infowindow */}
      {selectedPin && pins.find(pin => pin.id === selectedPin) && (
        <div
          ref={infoWindowRef}
          style={{
            position: 'absolute',
            left: `${infoWindowPosition.x}px`,
            top: `${infoWindowPosition.y}px`,
            transform: 'translateX(-50%)',
            width: 300,
            borderRadius: 10,
            overflow: 'hidden',
            border: '2.5px solid #FFD700', // gold
            background: '#181A1B', // dark background
            boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            zIndex: 30,
            pointerEvents: 'auto',
            paddingBottom: 16, // space for arrow
          }}
        >
          {/* Infowindow content */}
          {(() => {
            const pin = pins.find(p => p.id === selectedPin);
            const index = pins.findIndex(p => p.id === selectedPin);
            return (
              <>
                {/* Number badge */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  width: 32,
                  height: 32,
                  background: '#FFD700', // gold
                  color: '#181A1B', // dark text
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  zIndex: 2
                }}>{index + 1}</div>
                <img src={pin.image} alt={pin.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                <div style={{ padding: 15 }}>
                  <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2em', marginBottom: 8, letterSpacing: 0.5 }}>{pin.title}</div>
                  <div style={{ color: '#B0B3B8', fontWeight: 500, fontSize: '1em', marginBottom: 6 }}>Chest</div>
                  <div style={{ fontSize: '0.97em', margin: '8px 0', color: '#F3F4F6' }} dangerouslySetInnerHTML={{ __html: pin.description }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <a href={pin.google} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#FFD700', color: '#181A1B', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95em', whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>Book Now</a>
                    <a href={pin.direction} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#23272A', color: '#FFD700', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95em', whiteSpace: 'nowrap', border: '1.5px solid #FFD700' }}>Direction</a>
                    <a href={pin.website} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#23272A', color: '#FFD700', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95em', whiteSpace: 'nowrap', border: '1.5px solid #FFD700' }}>Learn More</a>
                  </div>
                </div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -16,
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: '16px solid #fff',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))',
                  zIndex: 11
                }} />
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Add marker CSS
const style = document.createElement('style');
style.innerHTML = `
.custom-marker {
  cursor: pointer;
  box-shadow: none !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
}
`;
document.head.appendChild(style);

export default Map; 