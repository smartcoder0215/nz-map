import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
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
  const [selectedPin, setSelectedPin] = useState(null);
  const markerRefs = useRef({});
  const [infoWindowPosition, setInfoWindowPosition] = useState({ x: 0, y: 0 });
  const infoWindowRef = useRef(null);
  const [infoWindowHeight, setInfoWindowHeight] = useState(0);

  // Function to add image overlay
  const addImageOverlay = (imageUrl, bounds) => {
    if (!map.current) return;

    // Add the image source
    map.current.addSource('overlay-image', {
      type: 'image',
      url: imageUrl,
      coordinates: bounds
    });

    // Add the image layer
    map.current.addLayer({
      id: 'overlay-layer',
      type: 'raster',
      source: 'overlay-image',
      paint: {
        'raster-opacity': 0.75
      }
    });
  };

  // Example usage of addImageOverlay:
  // addImageOverlay('path/to/your/image.jpg', [
  //   [172.5, -41.5], // Southwest coordinates
  //   [174.5, -40.5]  // Northeast coordinates
  // ]);

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

    // Blank style
    const blankStyle = {
      version: 8,
      sources: {},
      layers: [],
    };

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: blankStyle,
        center: [172.5, -41.5],
        zoom: 5.5,
        minZoom: 3,
        maxZoom: 15,
        attributionControl: true,
        bearing: 0,
        pitch: 0,
      });

      map.current.on('load', () => {
        // Add NZ map overlay as the only layer
        try {
          map.current.addSource('nz-overlay', {
            type: 'image',
            url: '/nz.jpg',
            coordinates: [
              [161.5, -31.0],
              [183.0, -31.0],
              [181.5, -49.5],
              [161.0, -50.0]
            ]
          });

          map.current.addLayer({
            id: 'nz-overlay-layer',
            type: 'raster',
            source: 'nz-overlay',
            paint: {
              'raster-opacity': 1
            }
          });

          // Disable map rotation
          map.current.dragRotate.disable();
          map.current.touchZoomRotate.disableRotation();

          // Set initial view to match overlay exactly
          map.current.fitBounds(
            [
              [161.0, -52.0],
              [181.0, -30.0]
            ],
            {
              padding: 0,
              maxZoom: 5.5
            }
          );

          // Add pins as markers (after overlay is loaded)
          markerRefs.current = {};
          pins.forEach((pin, index) => {
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
            el.innerText = (index + 1).toString();
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

        } catch (error) {
          console.error('Error adding NZ overlay:', error);
        }
      });

      // Cleanup on unmount
      return () => {
        cleanupMap();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message);
    }
  }, [pins]);

  // Update marker color when selectedPin changes
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, ref]) => {
      if (ref && ref.el) {
        ref.el.style.background = selectedPin == id ? '#dc2626' : '#1abc9c';
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
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
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
            border: '2px solid #22c55e',
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
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
                  background: '#dc2626',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                  zIndex: 2
                }}>{index + 1}</div>
                <img src={pin.image} alt={pin.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                <div style={{ padding: 15 }}>
                  <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2em', marginBottom: 8 }}>{pin.title}</div>
                  <div style={{ fontSize: '0.95em', margin: '8px 0', color: '#4b5563' }} dangerouslySetInnerHTML={{ __html: pin.description }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <a href={pin.google} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#16a34a', color: '#fff', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Book Now</a>
                    <a href={pin.direction} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Direction</a>
                    <a href={pin.website} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#dc2626', color: '#fff', borderRadius: 4, padding: '8px 4px', textDecoration: 'none', fontSize: '0.9em', whiteSpace: 'nowrap' }}>Learn More</a>
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
`;
document.head.appendChild(style);

export default Map; 