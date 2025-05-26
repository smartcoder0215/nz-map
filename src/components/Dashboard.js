import React, { useState, useRef, useEffect } from 'react';
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
    icon: 'attraction', // Default icon
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const modalRef = useRef();
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [uploadedIcons, setUploadedIcons] = useState([]);
  const [iconUploadFile, setIconUploadFile] = useState(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [iconUploadError, setIconUploadError] = useState(null);

  const resetForm = () => setForm({
    title: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    bookurl: '',
    direction: '',
    learnmore: '',
    icon: 'attraction', // Default icon
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
      icon: pin.icon || 'attraction', // Add icon to form
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
      learnmore: form.learnmore,
      icon: form.icon // Add icon to pin data
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
          website: updatedPin.learnmore,
          icon: updatedPin.icon // Add icon to pin object
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
          website: newPin.learnmore,
          icon: newPin.icon // Add icon to pin object
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

  useEffect(() => {
    fetchUploadedIcons();
  }, []);

  const fetchUploadedIcons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pin-icons`);
      const data = await res.json();
      setUploadedIcons(data);
    } catch (err) {
      setUploadedIcons([]);
    }
  };

  const handleIconFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setIconUploadError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setIconUploadError('File size must be less than 10MB');
        return;
      }
      setIconUploadFile(file);
      setIconUploadError(null);
    }
  };

  const handleIconUpload = async () => {
    if (!iconUploadFile) return;
    setIconUploading(true);
    setIconUploadError(null);
    const formData = new FormData();
    formData.append('image', iconUploadFile);
    formData.append('name', iconUploadFile.name);
    try {
      const res = await fetch(`${API_URL}/api/pin-icons`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setIconUploadFile(null);
      await fetchUploadedIcons();
    } catch (err) {
      setIconUploadError(err.message || 'Failed to upload icon');
    } finally {
      setIconUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Overlay Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Overlay Image Management */}
        <div className="w-full">
          <OverlayImageManager onOverlaySelect={handleOverlaySelect} />
        </div>

        {/* Active Overlay Preview */}
        {activeOverlay && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Active Overlay</h2>
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={activeOverlay.url}
                alt={activeOverlay.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">{activeOverlay.name}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Pin Management Section */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Pin Management
            </h2>
            <button
              onClick={openAddModal}
              className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add New Pin
            </button>
          </div>

          {/* Pins List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pins.map(pin => (
                  <tr key={pin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <img
                        src={pin.icon || (uploadedIcons[0] && uploadedIcons[0].url) || ''}
                        alt="Pin Icon"
                        className="w-8 h-8"
                        onError={e => { e.target.onerror = null; e.target.src = uploadedIcons[0] ? uploadedIcons[0].url : ''; }}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={pin.image}
                            alt={pin.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pin.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{pin.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {pin.coordinates[1].toFixed(4)}, {pin.coordinates[0].toFixed(4)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(pin)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pin.id)}
                          className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Pin' : 'Add New Pin'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Main Info */}
                <div>
                  <div className="font-semibold text-blue-500 mb-2">
                    Main Info
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="md:col-span-2">
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

                {/* Coordinates */}
                <div>
                  <div className="font-semibold text-blue-500 mb-2">
                    Coordinates
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Links */}
                <div>
                  <div className="font-semibold text-blue-500 mb-2">
                    Links
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">Booking URL</label>
                      <input 
                        name="bookurl" 
                        value={form.bookurl} 
                        onChange={handleChange} 
                        placeholder="Booking URL" 
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
                    <div className="md:col-span-2">
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

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pin Icon</label>
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    {uploadedIcons.map((icon) => (
                      <div
                        key={icon._id}
                        className={`cursor-pointer p-2 rounded-lg border-2 ${form.icon === icon.url ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setForm(f => ({ ...f, icon: icon.url }))}
                      >
                        <img
                          src={icon.url}
                          alt={icon.name}
                          className="w-8 h-8 mx-auto"
                        />
                        <p className="text-xs text-center mt-1">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconFileChange}
                      className="p-1 border rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleIconUpload}
                      disabled={!iconUploadFile || iconUploading}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs"
                    >
                      {iconUploading ? 'Uploading...' : 'Upload Pin Icon'}
                    </button>
                  </div>
                  {iconUploadError && <div className="text-red-500 text-xs mb-2">{iconUploadError}</div>}
                  <div className="text-xs text-gray-500">Max size: 10MB. Uploaded icons will appear above.</div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingId ? 'Update' : 'Create'}
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