import React, { useState, useRef } from 'react';

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

  return (
    <div style={{ 
      maxWidth: 1000, 
      margin: '32px auto', 
      padding: '24px 16px',
      '@media (max-width: 768px)': {
        margin: '16px auto',
        padding: '16px 12px'
      }
    }}>
      {error && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444',
          borderRadius: 6,
          color: '#dc2626',
          fontSize: '14px',
          '@media (max-width: 768px)': {
            fontSize: '13px',
            padding: '10px'
          }
        }}>
          {error}
        </div>
      )}
      <div style={{ 
        background: '#fff', 
        borderRadius: 16, 
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', 
        padding: '24px 16px',
        '@media (max-width: 768px)': {
          padding: '16px 12px',
          borderRadius: 12
        }
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 16,
          marginBottom: 24,
          '@media (min-width: 768px)': {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 800, 
            letterSpacing: '-1px', 
            color: '#222', 
            margin: 0,
            '@media (max-width: 768px)': {
              fontSize: 20
            }
          }}>
            Pin Dashboard
          </h2>
          <button 
            onClick={openAddModal} 
            style={{ 
              padding: '10px 24px', 
              background: '#22c55e', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: 'pointer', 
              boxShadow: '0 2px 8px #22c55e22',
              alignSelf: 'flex-start',
              '@media (max-width: 768px)': {
                fontSize: 14,
                padding: '8px 20px'
              }
            }}
          >
            + Add Pin
          </button>
        </div>
        <div style={{ 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          margin: '0 -16px',
          padding: '0 16px',
          '@media (max-width: 768px)': {
            margin: '0 -12px',
            padding: '0 12px'
          }
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: '#fff', 
            borderRadius: 12, 
            overflow: 'hidden', 
            fontSize: 14,
            minWidth: 600,
            '@media (max-width: 768px)': {
              fontSize: 13
            }
          }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>#</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Image</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Title</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Description</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Latitude</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Longitude</th>
                <th style={{ 
                  padding: 12, 
                  fontWeight: 700, 
                  color: '#222', 
                  textAlign: 'left',
                  '@media (max-width: 768px)': {
                    padding: '10px 8px'
                  }
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((pin, idx) => (
                <tr key={pin.id} style={{ 
                  background: idx % 2 === 0 ? '#fafbfc' : '#fff', 
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td style={{ 
                    padding: 12, 
                    fontWeight: 600,
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>{pin.id}</td>
                  <td style={{ 
                    padding: 12,
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>
                    <img 
                      src={pin.image} 
                      alt={pin.title} 
                      style={{ 
                        width: 56, 
                        height: 36, 
                        objectFit: 'cover', 
                        borderRadius: 6, 
                        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                        '@media (max-width: 768px)': {
                          width: 48,
                          height: 32
                        }
                      }} 
                    />
                  </td>
                  <td style={{ 
                    padding: 12, 
                    fontWeight: 600,
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>{pin.title}</td>
                  <td style={{ 
                    padding: 12, 
                    maxWidth: 220, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap', 
                    color: '#444',
                    '@media (max-width: 768px)': {
                      padding: '10px 8px',
                      maxWidth: 160
                    }
                  }}>{pin.description}</td>
                  <td style={{ 
                    padding: 12, 
                    color: '#666',
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>{pin.coordinates[1]}</td>
                  <td style={{ 
                    padding: 12, 
                    color: '#666',
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>{pin.coordinates[0]}</td>
                  <td style={{ 
                    padding: 12,
                    '@media (max-width: 768px)': {
                      padding: '10px 8px'
                    }
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: 8, 
                      flexWrap: 'nowrap',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      '@media (max-width: 768px)': {
                        gap: 6
                      }
                    }}>
                      <button 
                        onClick={() => openEditModal(pin)} 
                        style={{ 
                          background: '#2563eb', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 6, 
                          padding: '6px 12px', 
                          fontWeight: 600, 
                          fontSize: 14, 
                          cursor: 'pointer', 
                          transition: 'background 0.2s',
                          whiteSpace: 'nowrap',
                          minWidth: '60px',
                          '@media (max-width: 768px)': {
                            fontSize: 13,
                            padding: '5px 10px',
                            minWidth: '50px'
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(pin.id)} 
                        style={{ 
                          background: '#dc2626', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 6, 
                          padding: '6px 12px', 
                          fontWeight: 600, 
                          fontSize: 14, 
                          cursor: 'pointer', 
                          transition: 'background 0.2s',
                          whiteSpace: 'nowrap',
                          minWidth: '60px',
                          '@media (max-width: 768px)': {
                            fontSize: 13,
                            padding: '5px 10px',
                            minWidth: '50px'
                          }
                        }}
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
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.25)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px',
            '@media (max-width: 768px)': {
              padding: '12px'
            }
          }}
        >
          <div
            style={{ 
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
              padding: 0, 
              width: '100%',
              maxWidth: 480,
              position: 'relative', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column',
              '@media (max-width: 768px)': {
                borderRadius: 12,
                maxHeight: '95vh'
              }
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button" 
              onClick={closeModal} 
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                background: 'none', 
                border: 'none', 
                fontSize: 24, 
                color: '#888', 
                cursor: 'pointer', 
                zIndex: 2, 
                fontWeight: 700, 
                lineHeight: 1,
                padding: 8,
                '@media (max-width: 768px)': {
                  top: 12,
                  right: 12,
                  fontSize: 22
                }
              }} 
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ 
              padding: '24px 16px', 
              overflowY: 'auto',
              '@media (max-width: 768px)': {
                padding: '20px 12px'
              }
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                marginBottom: 16, 
                paddingRight: 32,
                '@media (max-width: 768px)': {
                  fontSize: 18,
                  marginBottom: 12
                }
              }}>
                {editingId ? 'Edit Pin' : 'Add Pin'}
              </h3>
              <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 16,
                '@media (max-width: 768px)': {
                  gap: 12
                }
              }}>
                {/* Main Info */}
                <div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: '#2563eb', 
                    marginBottom: 8, 
                    fontSize: 14,
                    '@media (max-width: 768px)': {
                      fontSize: 13,
                      marginBottom: 6
                    }
                  }}>
                    Main Info
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 12,
                    '@media (max-width: 768px)': {
                      gap: 10
                    }
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontWeight: 600, 
                        marginBottom: 4, 
                        fontSize: 14,
                        '@media (max-width: 768px)': {
                          fontSize: 13,
                          marginBottom: 3
                        }
                      }}>
                        Title
                      </label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        placeholder="Title" 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14,
                          '@media (max-width: 768px)': {
                            fontSize: 13,
                            padding: '7px 10px'
                          }
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Image URL</label>
                      <input 
                        name="image" 
                        value={form.image} 
                        onChange={handleChange} 
                        placeholder="Image URL" 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Description</label>
                      <input 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        placeholder="Description" 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <div style={{ 
                  borderTop: '1px solid #e5e7eb', 
                  margin: '0 -16px', 
                  height: 0,
                  '@media (max-width: 768px)': {
                    margin: '0 -12px'
                  }
                }} />
                {/* Coordinates */}
                <div>
                  <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 8, fontSize: 14 }}>Coordinates</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Latitude</label>
                      <input 
                        name="latitude" 
                        value={form.latitude} 
                        onChange={handleChange} 
                        placeholder="Latitude" 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Longitude</label>
                      <input 
                        name="longitude" 
                        value={form.longitude} 
                        onChange={handleChange} 
                        placeholder="Longitude" 
                        required 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0 -16px', height: 0 }} />
                {/* Links */}
                <div>
                  <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8, fontSize: 14 }}>Links</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Book Now URL</label>
                      <input 
                        name="bookurl" 
                        value={form.bookurl} 
                        onChange={handleChange} 
                        placeholder="Book Now URL" 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Direction URL</label>
                      <input 
                        name="direction" 
                        value={form.direction} 
                        onChange={handleChange} 
                        placeholder="Direction URL" 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Learn More URL</label>
                      <input 
                        name="learnmore" 
                        value={form.learnmore} 
                        onChange={handleChange} 
                        placeholder="Learn More URL" 
                        style={{ 
                          width: '100%',
                          padding: '8px 12px', 
                          borderRadius: 6, 
                          border: '1px solid #e5e7eb',
                          fontSize: 14
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: 8, 
                  marginTop: 8, 
                  justifyContent: 'flex-end',
                  '@media (max-width: 768px)': {
                    gap: 6,
                    marginTop: 6
                  }
                }}>
                  <button 
                    type="submit" 
                    style={{ 
                      padding: '10px 20px', 
                      background: editingId ? '#2563eb' : '#22c55e', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      fontWeight: 600, 
                      fontSize: 14, 
                      cursor: 'pointer', 
                      transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                      '@media (max-width: 768px)': {
                        fontSize: 13,
                        padding: '8px 16px'
                      }
                    }}
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    style={{ 
                      padding: '10px 20px', 
                      background: '#e5e7eb', 
                      color: '#222', 
                      border: 'none', 
                      borderRadius: 6, 
                      fontWeight: 600, 
                      fontSize: 14, 
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      '@media (max-width: 768px)': {
                        fontSize: 13,
                        padding: '8px 16px'
                      }
                    }}
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