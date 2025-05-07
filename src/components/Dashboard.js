import React, { useState, useRef } from 'react';

function Dashboard({ pins, setPins }) {
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    google: '',
    direction: '',
    website: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const modalRef = useRef();

  const resetForm = () => setForm({
    id: '', title: '', description: '', image: '', latitude: '', longitude: '', google: '', direction: '', website: ''
  });

  const openAddModal = () => {
    resetForm();
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = pin => {
    setForm({
      ...pin,
      latitude: pin.coordinates[1],
      longitude: pin.coordinates[0],
    });
    setEditingId(pin.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title || !form.image || !form.latitude || !form.longitude) return;
    const coordinates = [parseFloat(form.longitude), parseFloat(form.latitude)];
    if (editingId) {
      setPins(pins.map(p => p.id === editingId ? { ...form, id: editingId, coordinates } : p));
    } else {
      const newId = Math.max(0, ...pins.map(p => p.id)) + 1;
      setPins([...pins, { ...form, id: newId, coordinates }]);
    }
    closeModal();
  };

  const handleDelete = id => {
    setPins(pins.filter(p => p.id !== id));
    if (editingId === id) {
      closeModal();
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '32px auto', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#222' }}>Pin Dashboard</h2>
          <button onClick={openAddModal} style={{ padding: '10px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #22c55e22' }}>+ Add Pin</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', fontSize: 15 }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>#</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Image</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Title</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Description</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Latitude</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Longitude</th>
                <th style={{ padding: 12, fontWeight: 700, color: '#222' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((pin, idx) => (
                <tr key={pin.id} style={{ background: idx % 2 === 0 ? '#fafbfc' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{pin.id}</td>
                  <td style={{ textAlign: 'center' }}><img src={pin.image} alt={pin.title} style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} /></td>
                  <td style={{ fontWeight: 600 }}>{pin.title}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#444' }}>{pin.description}</td>
                  <td style={{ color: '#666' }}>{pin.coordinates[1]}</td>
                  <td style={{ color: '#666' }}>{pin.coordinates[0]}</td>
                  <td>
                    <button onClick={() => openEditModal(pin)} style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}>Edit</button>
                    <button onClick={() => handleDelete(pin.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}>Delete</button>
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
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: 0, minWidth: 400, maxWidth: '95vw', width: 480, position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button type="button" onClick={closeModal} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, color: '#888', cursor: 'pointer', zIndex: 2, fontWeight: 700, lineHeight: 1 }} aria-label="Close">×</button>
            <div style={{ padding: '32px 32px 24px 32px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>{editingId ? 'Edit Pin' : 'Add Pin'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Main Info */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: '#2563eb', marginBottom: 8, fontSize: 15, letterSpacing: '0.01em' }}>Main Info</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Title</label>
                      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Image URL</label>
                      <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                    <label style={{ fontWeight: 600, marginBottom: 4 }}>Description</label>
                    <input name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0 -32px 18px', height: 0 }} />
                {/* Coordinates */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 8, fontSize: 15, letterSpacing: '0.01em' }}>Coordinates</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Latitude</label>
                      <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Longitude</label>
                      <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0 -32px 18px', height: 0 }} />
                {/* Links */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8, fontSize: 15, letterSpacing: '0.01em' }}>Links</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Google Maps</label>
                      <input name="google" value={form.google} onChange={handleChange} placeholder="Google Maps URL" style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Direction URL</label>
                      <input name="direction" value={form.direction} onChange={handleChange} placeholder="Direction URL" style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                      <label style={{ fontWeight: 600, marginBottom: 4 }}>Website</label>
                      <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: editingId ? '#2563eb' : '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}>{editingId ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={closeModal} style={{ padding: '10px 20px', background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
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