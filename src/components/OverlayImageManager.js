import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OverlayImageManager({ onOverlaySelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/overlay-images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/overlay-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      await fetchImages();
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/overlay-images/${id}/activate`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to activate image');
      
      const updatedImage = await response.json();
      onOverlaySelect(updatedImage);
      await fetchImages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_URL}/api/overlay-images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');
      
      await fetchImages();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading overlay images...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Overlay Images</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-6">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image._id} className="border rounded p-2">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-32 object-cover mb-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm truncate">{image.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleActivate(image._id)}
                  className={`px-2 py-1 text-sm rounded ${
                    image.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {image.isActive ? 'Active' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OverlayImageManager; 