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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        e.target.value = null;
        return;
      }
      // Validate file size (10MB - Cloudinary free tier limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB (Cloudinary free tier limit)');
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('name', selectedFile.name);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/overlay-images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed');
      }

      await fetchImages();
      setSelectedFile(null);
      e.target.reset();
    } catch (error) {
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/overlay-images/${id}/activate`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Activation failed');
      }

      const data = await response.json();
      onOverlaySelect(data);
      await fetchImages();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/overlay-images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deletion failed');
      }

      await fetchImages();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading overlay images...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Overlay Images</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-6">
        <div className="flex flex-col gap-2">
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
          <div className="text-sm text-gray-500">
            Maximum file size: 10MB (Cloudinary free tier limit)
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
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
                  disabled={loading || image.isActive}
                >
                  {image.isActive ? 'Active' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={loading}
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