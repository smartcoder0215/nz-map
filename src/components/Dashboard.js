import React, { useState, useRef } from 'react';
import OverlayImageManager from './OverlayImageManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ pins, setPins }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    bookurl: '',
    direction: '',
    learnmore: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const modalRef = useRef();
  const [activeOverlay, setActiveOverlay] = useState(null);

  const resetForm = () => setForm({
    title: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    bookurl: '',
    direction: '',
    learnmore: '',
  });

  const openAddModal = () => {
    resetForm();
    setEditingId(null);
    setModalOpen(true);
    setError(null);
  };

  const openEditModal = pin => {
    setForm({
      title: pin.title,
      description: pin.description,
      image: pin.image,
      latitude: pin.coordinates[1],
      longitude: pin.coordinates[0],
      bookurl: pin.google,
      direction: pin.direction,
      learnmore: pin.website,
    });
    setEditingId(pin.id);
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
    setError(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.image || !form.latitude || !form.longitude) return;

    const coordinates = [parseFloat(form.longitude), parseFloat(form.latitude)];
    const pinData = {
      title: form.title,
      description: form.description,
      image: form.image,
      coordinates: coordinates,
      bookurl: form.bookurl,
      direction: form.direction,
      learnmore: form.learnmore
    };

    try {
    if (editingId) {
        // Update existing pin
        const response = await fetch(`${API_URL}/api/pins/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pinData),
        });

        if (!response.ok) {
          throw new Error('Failed to update pin');
        }

        const updatedPin = await response.json();
        setPins(pins.map(p => p.id === editingId ? {
          id: updatedPin._id,
          coordinates: updatedPin.coordinates,
          image: updatedPin.image,
          title: updatedPin.title,
          description: updatedPin.description,
          google: updatedPin.bookurl,
          direction: updatedPin.direction,
          website: updatedPin.learnmore
        } : p));
    } else {
        // Create new pin
        const response = await fetch(`${API_URL}/api/pins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pinData),
        });

        if (!response.ok) {
          throw new Error('Failed to create pin');
        }

        const newPin = await response.json();
        setPins([...pins, {
          id: newPin._id,
          coordinates: newPin.coordinates,
          image: newPin.image,
          title: newPin.title,
          description: newPin.description,
          google: newPin.bookurl,
          direction: newPin.direction,
          website: newPin.learnmore
        }]);
    }
    closeModal();
    } catch (err) {
      console.error('Error saving pin:', err);
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    try {
      const response = await fetch(`${API_URL}/api/pins/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pin');
      }

    setPins(pins.filter(p => p.id !== id));
    if (editingId === id) {
      closeModal();
      }
    } catch (err) {
      console.error('Error deleting pin:', err);
      setError(err.message);
    }
  };

  const handleOverlaySelect = (overlay) => {
    setActiveOverlay(overlay);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overlay Image Management */}
        <div>
          <OverlayImageManager onOverlaySelect={handleOverlaySelect} />
        </div>

        {/* Active Overlay Preview */}
        {activeOverlay && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Active Overlay</h2>
            <img
              src={activeOverlay.url}
              alt={activeOverlay.name}
              className="w-full h-64 object-contain"
            />
            <p className="mt-2 text-sm text-gray-600">{activeOverlay.name}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">
            Pin Dashboard
          </h2>
          <button 
            onClick={openAddModal} 
            className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold"
          >
            + Add Pin
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Latitude
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Longitude
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {pins.map((pin, idx) => (
                <tr key={pin.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {pin.id}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <img 
                      src={pin.image} 
                      alt={pin.title} 
                      className="w-16 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {pin.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {pin.description}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {pin.coordinates[1]}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {pin.coordinates[0]}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(pin)} 
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(pin.id)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div
          ref={modalRef}
          onClick={e => {
            if (e.target === modalRef.current) closeModal();
          }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div
            className="bg-white rounded-lg shadow p-0 w-full max-w-4xl relative max-h-90vh"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button" 
              onClick={closeModal} 
              className="absolute top-4 right-4 bg-none border-none text-gray-500 cursor-pointer z-20 font-semibold"
            >
              ×
            </button>
            <div className="p-8 overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">
                {editingId ? 'Edit Pin' : 'Add Pin'}
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Main Info */}
                <div>
                  <div className="font-semibold text-blue-500 mb-2">
                    Main Info
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block font-semibold mb-2">
                        Title
                      </label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        placeholder="Title" 
                        required 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Image URL</label>
                      <input 
                        name="image" 
                        value={form.image} 
                        onChange={handleChange} 
                        placeholder="Image URL" 
                        required 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        placeholder="Description" 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-4"></div>
                {/* Coordinates */}
                <div>
                  <div className="font-semibold text-green-500 mb-2">Coordinates</div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block font-semibold mb-2">Latitude</label>
                      <input 
                        name="latitude" 
                        value={form.latitude} 
                        onChange={handleChange} 
                        placeholder="Latitude" 
                        required 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Longitude</label>
                      <input 
                        name="longitude" 
                        value={form.longitude} 
                        onChange={handleChange} 
                        placeholder="Longitude" 
                        required 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-4"></div>
                {/* Links */}
                <div>
                  <div className="font-semibold text-red-500 mb-2">Links</div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block font-semibold mb-2">Book Now URL</label>
                      <input 
                        name="bookurl" 
                        value={form.bookurl} 
                        onChange={handleChange} 
                        placeholder="Book Now URL" 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Direction URL</label>
                      <input 
                        name="direction" 
                        value={form.direction} 
                        onChange={handleChange} 
                        placeholder="Direction URL" 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Learn More URL</label>
                      <input 
                        name="learnmore" 
                        value={form.learnmore} 
                        onChange={handleChange} 
                        placeholder="Learn More URL" 
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 justify-end">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-500 text-white rounded font-semibold"
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 