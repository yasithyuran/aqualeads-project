import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const ManageInterior = () => {
  const [interiors, setInteriors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingInterior, setEditingInterior] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Image editing state
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Fetch all interiors
  const fetchInteriors = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('https://aqualeads-project.onrender.com/api/interiors/all');
      const data = await res.json();
      if (data.success) {
        const sorted = data.interiors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInteriors(sorted);
        setFiltered(sorted);
      } else {
        setErrorMsg('Failed to load interiors');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInteriors(); }, []);

  // Search
  const handleSearch = e => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) return setFiltered(interiors);
    setFiltered(interiors.filter(i => 
      i.title.toLowerCase().includes(term) || 
      i.location.toLowerCase().includes(term)
    ));
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (image.path) return image.path;  // ✅ Cloudinary URL - use directly!
    if (image.filename) return `https://aqualeads-project.onrender.com/uploads/${image.filename}`;
    return '/api/placeholder/100/100';
  };

  // Open edit modal
  const handleEditClick = interior => {
    setEditingInterior(interior);
    setEditForm({
      title: interior.title,
      location: interior.location,
      budget: interior.budget,
      shortDescription: interior.shortDescription
    });
    setNewImages([]);
    setImagesToDelete([]);
    setEditModal(true);
  };

  // Form change
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle new images upload
  const handleNewImagesUpload = e => {
    const files = Array.from(e.target.files);
    const newImgs = [];
    
    let processedCount = 0;
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          newImgs.push({ file, preview: ev.target.result, caption: '' });
          processedCount++;
          if (processedCount === files.length) {
            setNewImages(prev => [...prev, ...newImgs]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        processedCount++;
      }
    });
  };

  // Mark existing image for deletion
  const markImageForDeletion = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  // Undo deletion
  const undoImageDeletion = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  // Remove new image before upload
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update new image caption
  const updateNewImageCaption = (index, caption) => {
    setNewImages(prev => 
      prev.map((img, i) => i === index ? { ...img, caption } : img)
    );
  };

  // Submit edit
  const handleEditSubmit = async e => {
    e.preventDefault();
    
    if (!editForm.title || !editForm.location || !editForm.shortDescription) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('location', editForm.location);
      formData.append('budget', editForm.budget || '');
      formData.append('shortDescription', editForm.shortDescription);

      // Handle image deletions
      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      // Handle new images
      if (newImages.length > 0) {
        newImages.forEach(img => {
          formData.append('images', img.file);
        });
        const captions = newImages.map(img => img.caption);
        formData.append('captions', JSON.stringify(captions));
      }

      const res = await fetch(`https://aqualeads-project.onrender.com/api/interiors/${editingInterior._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Interior updated successfully!');
        fetchInteriors();
        setEditModal(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Update failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Server error while updating');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete interior
  const handleDelete = async id => {
    if (!window.confirm('Delete this interior?')) return;
    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/interiors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInteriors(prev => prev.filter(i => i._id !== id));
        setFiltered(prev => prev.filter(i => i._id !== id));
        setSuccessMsg('Interior deleted!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Interiors</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by title or location..." 
              value={searchTerm} 
              onChange={handleSearch} 
              className="search-input"
            />
          </div>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && !loading && <div className="alert alert-error">{errorMsg}</div>}

        {loading ? (
          <div className="loading-state"><Loader2 className="spinner" /> Loading...</div>
        ) : (
          filtered.length === 0 ? <div className="empty-state">No interiors found</div> : (
            <div className="table-wrapper">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Budget</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i._id}>
                      <td>
                        {i.images && i.images.length > 0 ? (
                          <img 
                            src={getImageUrl(i.images[0])} 
                            alt={i.title}
                            className="article-thumbnail"
                            onError={(e) => e.target.src = '/api/placeholder/100/100'}
                          />
                        ) : (
                          <div className="no-image-placeholder">No image</div>
                        )}
                      </td>
                      <td>{i.title}</td>
                      <td>{i.location}</td>
                      <td>{i.budget}</td>
                      <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button onClick={() => handleEditClick(i)} className="btn-edit" title="Edit"><Edit3 className="icon" /></button>
                        <button onClick={() => handleDelete(i._id)} className="btn-delete" title="Delete"><Trash2 className="icon" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Edit Modal */}
      {editModal && editingInterior && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Interior</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}><X className="icon" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={editForm.title} onChange={handleEditChange} required className="form-input"/>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input name="location" value={editForm.location} onChange={handleEditChange} required className="form-input"/>
              </div>

              <div className="form-group">
                <label>Budget</label>
                <input name="budget" value={editForm.budget} onChange={handleEditChange} className="form-input"/>
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea name="shortDescription" value={editForm.shortDescription} onChange={handleEditChange} rows="3" required className="form-input"/>
              </div>

              {/* Current Images */}
              <div className="form-section-divider">
                <h3>Images</h3>
              </div>

              {editingInterior.images && editingInterior.images.length > 0 && (
                <div className="form-group">
                  <label>Current Images ({editingInterior.images.filter(img => !imagesToDelete.includes(img._id)).length})</label>
                  <div className="images-grid">
                    {editingInterior.images.map((img, idx) => (
                      <div key={idx} className="grid-image-item">
                        {imagesToDelete.includes(img._id) ? (
                          <div className="deleted-image-overlay">
                            <p>Will be deleted</p>
                            <button 
                              type="button" 
                              onClick={() => undoImageDeletion(img._id)}
                              className="btn-undo-small"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={getImageUrl(img)} 
                              alt={img.caption || `Image ${idx + 1}`}
                              className="grid-thumbnail"
                            />
                            {img.caption && <p className="grid-caption">{img.caption}</p>}
                            <button 
                              type="button" 
                              onClick={() => markImageForDeletion(img._id)}
                              className="btn-delete-grid"
                            >
                              <Trash2 className="btn-icon-small" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images to Add */}
              {newImages.length > 0 && (
                <div className="form-group">
                  <label>New Images to Add ({newImages.length})</label>
                  <div className="images-grid">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="grid-image-item">
                        <img 
                          src={img.preview} 
                          alt="New"
                          className="grid-thumbnail"
                        />
                        <input
                          type="text"
                          placeholder="Caption"
                          value={img.caption}
                          onChange={(e) => updateNewImageCaption(idx, e.target.value)}
                          className="grid-caption-input"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(idx)}
                          className="btn-delete-grid"
                        >
                          <X className="btn-icon-small" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images Button */}
              <div className="form-group">
                <input
                  id="interiorImagesInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImagesUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('interiorImagesInput').click()}
                  className="btn-add-image"
                >
                  <ImageIcon className="btn-icon" /> Add Images
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInterior;