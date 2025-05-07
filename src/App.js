import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Map from './components/Map';
import Dashboard from './components/Dashboard';

const initialPins = [
  {
    id: 1,
    coordinates: [174.7633, -36.8485],
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'AUCKLAND BATHS',
    description: 'Modern bathhouse with <b>natural hot springs</b> and city views.',
    google: 'https://maps.google.com/?q=-36.8485,174.7633',
    direction: 'https://maps.google.com/dir/?api=1&destination=-36.8485,174.7633',
    website: 'https://aucklandbaths.example.com'
  },
  {
    id: 2,
    coordinates: [172.6362, -43.5321],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'CHRISTCHURCH ONSEN',
    description: 'Relax in <b>geothermal pools</b> with views of the Southern Alps.',
    google: 'https://maps.google.com/?q=-43.5321,172.6362',
    direction: 'https://maps.google.com/dir/?api=1&destination=-43.5321,172.6362',
    website: 'https://christchurchonsen.example.com'
  },
  {
    id: 3,
    coordinates: [170.5036, -45.8742],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'DUNEDIN SPA',
    description: 'Historic spa with <b>art deco architecture</b> and mineral-rich waters.',
    google: 'https://maps.google.com/?q=-45.8742,170.5036',
    direction: 'https://maps.google.com/dir/?api=1&destination=-45.8742,170.5036',
    website: 'https://dunedinspa.example.com'
  },
  {
    id: 4,
    coordinates: [175.2793, -37.7870],
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    title: 'HAMILTON HOT SPRINGS',
    description: 'Family-friendly hot springs with <b>lush gardens</b> and picnic areas.',
    google: 'https://maps.google.com/?q=-37.7870,175.2793',
    direction: 'https://maps.google.com/dir/?api=1&destination=-37.7870,175.2793',
    website: 'https://hamiltonhotsprings.example.com'
  },
  {
    id: 5,
    coordinates: [173.2839, -41.2706],
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    title: 'NELSON MINERAL POOLS',
    description: 'Outdoor mineral pools surrounded by <b>native bush</b> and mountain views.',
    google: 'https://maps.google.com/?q=-41.2706,173.2839',
    direction: 'https://maps.google.com/dir/?api=1&destination=-41.2706,173.2839',
    website: 'https://nelsonmineralpools.example.com'
  },
];

function App() {
  const [pins, setPins] = useState(initialPins);

  return (
    <Router>
      <nav style={{ padding: 16, background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
        <Link to="/" style={{ marginRight: 16 }}>Map</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Map pins={pins} setPins={setPins} />} />
        <Route path="/dashboard" element={<Dashboard pins={pins} setPins={setPins} />} />
      </Routes>
    </Router>
  );
}

export default App;
