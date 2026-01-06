import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const FISH_SUBTYPES = [
  { value: 'planted_large_tank', label: 'Planted Large Tank Fish' },
  { value: 'marine', label: 'Marine Fish' },
  { value: 'algae_cleaners', label: 'Algae Cleaners' },
  { value: 'snails', label: 'Snails' },
  { value: 'nano_fish', label: 'Nano Fish' },
  { value: 'shrimps', label: 'Shrimps' },
  { value: 'crabs', label: 'Crabs' },
  { value: 'bottom_cleaners', label: 'Bottom Cleaners' },
  { value: 'monster_fish', label: 'Monster Fish' },
  { value: 'export_only', label: 'Export Only Fish' },
  { value: 'exotic_fish', label: 'Exotic Fish' },
  { value: 'other', label: 'Other' },
];

const PLANT_SUBTYPES = [
  { value: 'low_tech', label: 'Low Tech Plants' },
  { value: 'high_tech', label: 'High Tech Plants' },
  { value: 'paludarium', label: 'Paludarium Plants' },
  { value: 'other', label: 'Other' },
];

const ManageLivestock = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Optional fields toggles
  const [showPricing, setShowPricing] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  // Image editing state
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [deleteImage, setDeleteImage] = useState(false);

  // Fetch all livestock items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('http://https://aqualead-project.onrender.com/api/livestock?limit=1000');
      const data = await res.json();
      
      if (data.success) {
        const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(sorted);
        setFiltered(sorted);
      } else {
        setErrorMsg('Failed to load livestock items');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // Search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) return setFiltered(items);
    setFiltered(items.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.itemType.toLowerCase().includes(term) ||
      item.subType.toLowerCase().includes(term)
    ));
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/100/100';
    if (image.filename) return `http://https://aqualead-project.onrender.com/uploads/${image.filename}`;
    if (image.path) return `http://https://aqualead-project.onrender.com${image.path}`;
    return '/api/placeholder/100/100';
  };

  // Get subtype label
  const getSubtypeLabel = (itemType, subType) => {
    const options = itemType === 'fish' ? FISH_SUBTYPES : PLANT_SUBTYPES;
    const found = options.find(o => o.value === subType);
    return found ? found.label : subType;
  };

  // Get subtype options
  const getSubtypeOptions = (itemType) => {
    return itemType === 'fish' ? FISH_SUBTYPES : PLANT_SUBTYPES;
  };

  // Helper to check if item has pricing
  const hasPrice = (item) => item.price !== undefined && item.price !== null;
  
  // Helper to check if item has availability
  const hasAvailability = (item) => item.availability !== undefined && item.availability !== null;

  // Open edit modal
  const handleEditClick = (item) => {
    setEditingItem(item);
    const itemHasPrice = hasPrice(item);
    const itemHasAvailability = hasAvailability(item);
    
    setEditForm({
      name: item.name,
      itemType: item.itemType,
      subType: item.subType,
      price: item.price || '',
      currency: item.currency || 'LKR',
      unit: item.unit || 'each',
      availability: item.availability || true
    });
    
    setShowPricing(itemHasPrice);
    setShowAvailability(itemHasAvailability);
    setNewImage(null);
    setNewImagePreview('');
    setDeleteImage(false);
    setEditModal(true);
  };

  // Form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle pricing
  const togglePricing = () => {
    const newShowPricing = !showPricing;
    setShowPricing(newShowPricing);
    if (!newShowPricing) {
      setEditForm(prev => ({
        ...prev,
        price: '',
        currency: 'LKR',
        unit: 'each'
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        currency: 'LKR',
        unit: 'each'
      }));
    }
  };

  // Toggle availability
  const toggleAvailability = () => {
    const newShowAvailability = !showAvailability;
    setShowAvailability(newShowAvailability);
    if (!newShowAvailability) {
      setEditForm(prev => ({ ...prev, availability: null }));
    } else {
      setEditForm(prev => ({ ...prev, availability: true }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      setDeleteImage(false);
    }
  };

  // Delete image
  const handleDeleteImage = () => {
    setDeleteImage(true);
    setNewImage(null);
    setNewImagePreview('');
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.itemType || !editForm.subType) {
      alert('Please fill all required fields (name, type, sub-category)');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('itemType', editForm.itemType);
      formData.append('subType', editForm.subType);
      
      // Only append pricing if enabled and has value
      if (showPricing && editForm.price && editForm.price !== '') {
        formData.append('price', editForm.price);
        formData.append('currency', editForm.currency);
        formData.append('unit', editForm.unit);
      }
      
      // Only append availability if enabled
      if (showAvailability && editForm.availability !== null) {
        formData.append('availability', editForm.availability);
      }

      if (deleteImage) {
        formData.append('deleteImage', 'true');
      } else if (newImage) {
        formData.append('image', newImage);
      }

      const res = await fetch(`http://https://aqualead-project.onrender.com/api/livestock/${editingItem._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Item updated successfully!');
        fetchItems();
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

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`http://https://aqualead-project.onrender.com/api/livestock/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(i => i._id !== id));
        setFiltered(prev => prev.filter(i => i._id !== id));
        setSuccessMsg('Item deleted!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Livestock</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, type..." 
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
          filtered.length === 0 ? <div className="empty-state">No livestock items found</div> : (
            <div className="table-wrapper">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Sub Type</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id}>
                      <td>
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name}
                          className="article-thumbnail"
                          onError={(e) => e.target.src = '/api/placeholder/100/100'}
                        />
                      </td>
                      <td className="font-medium">{item.name}</td>
                      <td className="capitalize">{item.itemType}</td>
                      <td>{getSubtypeLabel(item.itemType, item.subType)}</td>
                      <td>
                        {hasPrice(item) ? (
                          `${item.price} ${item.currency}/${item.unit}`
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>No price</span>
                        )}
                      </td>
                      <td>
                        {hasAvailability(item) ? (
                          <span className={`status-badge ${item.availability ? 'available' : 'unavailable'}`}>
                            {item.availability ? 'In Stock' : 'Out of Stock'}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>Not set</span>
                        )}
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button onClick={() => handleEditClick(item)} className="btn-edit" title="Edit"><Edit3 className="icon" /></button>
                        <button onClick={() => handleDelete(item._id)} className="btn-delete" title="Delete"><Trash2 className="icon" /></button>
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
      {editModal && editingItem && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Livestock Item</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}><X className="icon" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Item Type *</label>
                <select name="itemType" value={editForm.itemType} onChange={handleEditChange} className="form-input">
                  <option value="fish">Fish</option>
                  <option value="plant">Plant</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sub Category *</label>
                <select name="subType" value={editForm.subType} onChange={handleEditChange} className="form-input">
                  <option value="">-- Select --</option>
                  {getSubtypeOptions(editForm.itemType).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} required className="form-input"/>
              </div>

              {/* Optional Pricing Section */}
              <div className="form-section-divider">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={showPricing} 
                    onChange={togglePricing}
                  />
                  <span>Include Pricing Information</span>
                </label>
              </div>

              {showPricing && (
                <>
                  <div className="form-group">
                    <label>Price</label>
                    <input 
                      name="price" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      value={editForm.price} 
                      onChange={handleEditChange} 
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency</label>
                    <select name="currency" value={editForm.currency} onChange={handleEditChange} className="form-input">
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unit</label>
                    <select name="unit" value={editForm.unit} onChange={handleEditChange} className="form-input">
                      <option value="each">Each</option>
                      <option value="pair">Pair</option>
                      <option value="bunch">Bunch</option>
                      <option value="pot">Pot</option>
                    </select>
                  </div>
                </>
              )}

              {/* Optional Availability Section */}
              <div className="form-section-divider">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={showAvailability} 
                    onChange={toggleAvailability}
                  />
                  <span>Include Availability Status</span>
                </label>
              </div>

              {showAvailability && (
                <div className="form-group">
                  <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="availability" 
                        checked={editForm.availability === true} 
                        onChange={() => setEditForm(prev => ({ ...prev, availability: true }))}
                      />
                      <span>In Stock</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="availability" 
                        checked={editForm.availability === false} 
                        onChange={() => setEditForm(prev => ({ ...prev, availability: false }))}
                      />
                      <span>Out of Stock</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Image Section */}
              <div className="form-section-divider">
                <h3>Image</h3>
              </div>

              {editingItem.image && !deleteImage && !newImagePreview && (
                <div className="form-group">
                  <label>Current Image</label>
                  <div className="image-with-actions">
                    <img 
                      src={getImageUrl(editingItem.image)} 
                      alt="Current"
                      className="current-image-preview"
                    />
                    <div className="image-actions">
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('livestockImageInput').click()}
                        className="btn-update"
                      >
                        <Upload className="btn-icon" /> Update
                      </button>
                      <button 
                        type="button" 
                        onClick={handleDeleteImage}
                        className="btn-delete-img"
                      >
                        <Trash2 className="btn-icon" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deleteImage && !newImagePreview && (
                <div className="form-group">
                  <div className="deleted-notice">
                    Image will be deleted when you save changes.
                    <button 
                      type="button" 
                      onClick={() => setDeleteImage(false)}
                      className="btn-undo"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              )}

              {newImagePreview && (
                <div className="form-group">
                  <label>New Image</label>
                  <div className="image-with-actions">
                    <img src={newImagePreview} alt="New" className="current-image-preview" />
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewImage(null);
                        setNewImagePreview('');
                      }}
                      className="btn-delete-img"
                    >
                      <X className="btn-icon" /> Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                id="livestockImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {!editingItem.image && !newImagePreview && (
                <div className="form-group">
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('livestockImageInput').click()}
                    className="btn-add-image"
                  >
                    <ImageIcon className="btn-icon" /> Add Image
                  </button>
                </div>
              )}

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

export default ManageLivestock;