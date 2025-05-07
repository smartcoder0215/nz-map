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

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [styleData, setStyleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    </div>
  );
};

export default Map; 