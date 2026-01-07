import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const MAIN_CATEGORIES = [
  { value: 'aquarium', label: 'Aquarium' },
  { value: 'paludarium', label: 'Paludarium' },
  { value: 'terrarium', label: 'Terrarium' },
  { value: 'vivarium', label: 'Vivarium' },
  { value: 'scenarium', label: 'Scenarium' },
  { value: 'pond', label: 'Pond' },
  { value: 'landscape', label: 'Landscaping' },
];

const AQUARIUM_TYPES = [
  { value: 'marine', label: 'Marine' },
  { value: 'freshwater', label: 'Fresh Water' },
];

const FRESHWATER_TYPES = [
  { value: 'biotope', label: 'Biotope' },
  { value: 'planted', label: 'Planted' },
  { value: 'aquascaping', label: 'Aquascaping' },
];

const PLANTED_TYPES = [
  { value: 'zero', label: 'Zero Maintain' },
  { value: 'highm', label: 'High Maintain' },
  { value: 'lowm', label: 'Low Maintain' },
];

const AQUASCAPING_TYPES = [
  { value: 'hight', label: 'High Tech' },
  { value: 'lowt', label: 'Low Tech' },
];

const ManageAriums = () => {
  const [ariums, setAriums] = useState([]);
  const [filteredAriums, setFilteredAriums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editModal, setEditModal] = useState(false);
  const [editingArium, setEditingArium] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const fetchAllAriums = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await fetch('https://aqualeads-project.onrender.com/api/ariums');
      const data = await response.json();

      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAriums(sorted);
        setFilteredAriums(sorted);
      } else {
        setErrorMsg('Failed to load ariums.');
        console.error('Response:', data);
      }
    } catch (err) {
      setErrorMsg('Error connecting to server.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAriums();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredAriums(ariums);
    } else {
      const filtered = ariums.filter(arium =>
        arium.title.toLowerCase().includes(value) ||
        arium.mainCategory.toLowerCase().includes(value) ||
        (arium.subCategory && arium.subCategory.toLowerCase().includes(value)) ||
        (arium.description && arium.description.toLowerCase().includes(value))
      );
      setFilteredAriums(filtered);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/100/100';
    if (image.path) return `https://aqualeads-project.onrender.com${image.path}`;
    if (image.filename) return `https://aqualeads-project.onrender.com/uploads/ariums/${image.filename}`;
    return '/api/placeholder/100/100';
  };

  const getCategoryLabel = (value) => {
    const cat = MAIN_CATEGORIES.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  const getSubCategoryPath = (arium) => {
    const parts = [getCategoryLabel(arium.mainCategory)];
    
    if (arium.subCategory) {
      const sub = AQUARIUM_TYPES.find(t => t.value === arium.subCategory);
      if (sub) parts.push(sub.label);
    }
    
    if (arium.subSubCategory) {
      const subSub = FRESHWATER_TYPES.find(t => t.value === arium.subSubCategory);
      if (subSub) parts.push(subSub.label);
    }
    
    if (arium.subSubSubCategory) {
      const planted = PLANTED_TYPES.find(t => t.value === arium.subSubSubCategory);
      const aquascaping = AQUASCAPING_TYPES.find(t => t.value === arium.subSubSubCategory);
      if (planted) parts.push(planted.label);
      if (aquascaping) parts.push(aquascaping.label);
    }
    
    return parts.join(' > ');
  };

  const handleEditClick = (arium) => {
    setEditingArium(arium);
    setEditFormData({
      title: arium.title || '',
      mainCategory: arium.mainCategory || 'aquarium',
      subCategory: arium.subCategory || '',
      subSubCategory: arium.subSubCategory || '',
      subSubSubCategory: arium.subSubSubCategory || '',
      type: arium.type || 'gallery',
      description: arium.description || '',
    });
    setNewImages([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'mainCategory') {
        updated.subCategory = '';
        updated.subSubCategory = '';
        updated.subSubSubCategory = '';
      }
      if (name === 'subCategory') {
        updated.subSubCategory = '';
        updated.subSubSubCategory = '';
      }
      if (name === 'subSubCategory') {
        updated.subSubSubCategory = '';
      }
      
      return updated;
    });
  };

  const handleNewImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setNewImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreviews(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const undoImageDeletion = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const showAquariumSub = editFormData.mainCategory === 'aquarium';
  const showFreshwaterSub = editFormData.mainCategory === 'aquarium' && editFormData.subCategory === 'freshwater';
  const showPlantedSub = editFormData.mainCategory === 'aquarium' && 
                          editFormData.subCategory === 'freshwater' && 
                          editFormData.subSubCategory === 'planted';
  const showAquascapingSub = editFormData.mainCategory === 'aquarium' && 
                              editFormData.subCategory === 'freshwater' && 
                              editFormData.subSubCategory === 'aquascaping';

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title) {
      alert('Please enter a title');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('mainCategory', editFormData.mainCategory);
      formData.append('type', editFormData.type);
      formData.append('description', editFormData.description);
      
      if (editFormData.subCategory) formData.append('subCategory', editFormData.subCategory);
      if (editFormData.subSubCategory) formData.append('subSubCategory', editFormData.subSubCategory);
      if (editFormData.subSubSubCategory) formData.append('subSubSubCategory', editFormData.subSubSubCategory);

      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      newImages.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`https://aqualeads-project.onrender.com/api/ariums/${editingArium._id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Arium updated successfully!');
        fetchAllAriums();
        setEditModal(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to update arium: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating arium:', err);
      alert('Server error while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this arium? All associated images will be deleted.')) return;

    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/ariums/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setAriums(prev => prev.filter(a => a._id !== id));
        setFilteredAriums(prev => prev.filter(a => a._id !== id));
        setSuccessMsg('Arium deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to delete arium: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting arium:', err);
      alert('Server error while deleting.');
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Ariums</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, category..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && !isLoading && <div className="alert alert-error">{errorMsg}</div>}

        {isLoading && (
          <div className="loading-state">
            <Loader2 className="spinner" />
            <span>Loading ariums...</span>
          </div>
        )}

        {!isLoading && !errorMsg && filteredAriums.length === 0 && (
          <div className="empty-state">No ariums found.</div>
        )}

        {!isLoading && filteredAriums.length > 0 && (
          <div className="table-wrapper">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Images</th>
                  <th>Title</th>
                  <th>Category Path</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAriums.map((arium) => (
                  <tr key={arium._id}>
                    <td>
                      {arium.images && arium.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {arium.images.slice(0, 3).map((img, idx) => (
                            <img 
                              key={idx}
                              src={getImageUrl(img)} 
                              alt={`${arium.title}-${idx}`}
                              className="article-thumbnail"
                              onError={(e) => e.target.src = '/api/placeholder/60/60'}
                            />
                          ))}
                          {arium.images.length > 3 && (
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              +{arium.images.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="no-image-placeholder">No images</div>
                      )}
                    </td>
                    <td className="font-medium">{arium.title}</td>
                    <td style={{ fontSize: '13px' }}>{getSubCategoryPath(arium)}</td>
                    <td>
                      <span className={`status-badge ${arium.type === 'project' ? 'status-available' : 'status-unavailable'}`}>
                        {arium.type === 'project' ? 'Project' : 'Gallery'}
                      </span>
                    </td>
                    <td>{new Date(arium.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditClick(arium)}
                        className="btn-edit"
                        title="Edit Arium"
                      >
                        <Edit3 className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(arium._id)}
                        className="btn-delete"
                        title="Delete Arium"
                      >
                        <Trash2 className="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && editingArium && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Arium</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Main Category *</label>
                <select
                  name="mainCategory"
                  value={editFormData.mainCategory}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  {MAIN_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {showAquariumSub && (
                <div className="form-group">
                  <label>Aquarium Type</label>
                  <select
                    name="subCategory"
                    value={editFormData.subCategory}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">-- Select --</option>
                    {AQUARIUM_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {showFreshwaterSub && (
                <div className="form-group">
                  <label>Fresh Water Type</label>
                  <select
                    name="subSubCategory"
                    value={editFormData.subSubCategory}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">-- Select --</option>
                    {FRESHWATER_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {showPlantedSub && (
                <div className="form-group">
                  <label>Planted Maintenance</label>
                  <select
                    name="subSubSubCategory"
                    value={editFormData.subSubSubCategory}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">-- Select --</option>
                    {PLANTED_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {showAquascapingSub && (
                <div className="form-group">
                  <label>Aquascaping Tech Level</label>
                  <select
                    name="subSubSubCategory"
                    value={editFormData.subSubSubCategory}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="">-- Select --</option>
                    {AQUASCAPING_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  <option value="gallery">Gallery</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="4"
                  className="form-input"
                />
              </div>

              <div className="form-section-divider">
                <h3>Images</h3>
              </div>

              {/* Current Images */}
              {editingArium.images && editingArium.images.length > 0 && (
                <div className="form-group">
                  <label>Current Images</label>
                  <div className="images-grid">
                    {editingArium.images.map((img, idx) => (
                      <div key={idx} className="grid-image-item">
                        {imagesToDelete.includes(img._id || idx) ? (
                          <div className="deleted-image-overlay">
                            <p>Will be deleted</p>
                            <button 
                              type="button" 
                              onClick={() => undoImageDeletion(img._id || idx)}
                              className="btn-undo-small"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={getImageUrl(img)} 
                              alt={`current-${idx}`}
                              className="grid-thumbnail"
                            />
                            <button 
                              type="button" 
                              onClick={() => markImageForDeletion(img._id || idx)}
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

              {/* New Images Preview */}
              {newImagePreviews.length > 0 && (
                <div className="form-group">
                  <label>New Images to Add</label>
                  <div className="images-grid">
                    {newImagePreviews.map((preview, idx) => (
                      <div key={idx} className="grid-image-item">
                        <img 
                          src={preview} 
                          alt={`new-${idx}`}
                          className="grid-thumbnail"
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

              <div className="form-group">
                <input
                  id="ariumImagesInput"
                  type="file"
                  accept="image/*"
                  onChange={handleNewImagesUpload}
                  multiple
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('ariumImagesInput').click()}
                  className="btn-add-image"
                >
                  <ImageIcon className="btn-icon" /> Add More Images
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-submit">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAriums;