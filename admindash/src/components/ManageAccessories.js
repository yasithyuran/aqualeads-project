import React, { useEffect, useState, useMemo } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const HARDSCAPE_SUBTYPES = [
  { value: 'full_hardscapes', label: 'Full Hardscapes' },
  { value: 'driftwoods', label: 'Driftwoods' },
  { value: 'stones', label: 'Stones' },
  { value: 'sand', label: 'Sand' },
  { value: 'gravel', label: 'Gravel' },
];

const FILTER_SUBTYPES = [
  { value: 'hangon_back', label: 'Hang-on Back' },
  { value: 'canister', label: 'Canister' },
  { value: 'water_pumps', label: 'Water Pumps' },
  { value: 'power_filters', label: 'Power Filters' },
  { value: 'other_filters', label: 'Other' },
];

const EQUIPMENT_SUBTYPES = [
  { value: 'heaters', label: 'Heaters' },
  { value: 'air_pumps', label: 'Air Pumps' },
  { value: 'co2_systems', label: 'CO2 Systems' },
  { value: 'test_kits', label: 'Test Kits' },
  { value: 'cleaning_tools', label: 'Cleaning Tools' },
  { value: 'other_equipment', label: 'Other Equipment' },
];

const CATEGORIES = [
  { value: 'hardscape', label: 'Hardscape Items' },
  { value: 'lights', label: 'Lights' },
  { value: 'filters', label: 'Filters' },
  { value: 'equipments', label: 'Equipments' }
];

const ManageAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [filteredAccessories, setFilteredAccessories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image editing state
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteCurrentImage, setDeleteCurrentImage] = useState(false);

  // Get subcategory options based on category
  const subtypeOptions = useMemo(() => {
    if (!editFormData.category) return [];
    switch (editFormData.category) {
      case 'hardscape': return HARDSCAPE_SUBTYPES;
      case 'filters': return FILTER_SUBTYPES;
      case 'equipments': return EQUIPMENT_SUBTYPES;
      case 'lights': return [];
      default: return [];
    }
  }, [editFormData.category]);

  // Fetch all accessories
  const fetchAllAccessories = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await fetch('https://aqualeads-project.onrender.com/api/accessories');
      const data = await response.json();

      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAccessories(sorted);
        setFilteredAccessories(sorted);
      } else {
        setErrorMsg('Failed to load accessories.');
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
    fetchAllAccessories();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredAccessories(accessories);
    } else {
      const filtered = accessories.filter(acc =>
        acc.name.toLowerCase().includes(value) ||
        acc.category.toLowerCase().includes(value) ||
        (acc.subCategory && acc.subCategory.toLowerCase().includes(value)) ||
        acc.description.toLowerCase().includes(value)
      );
      setFilteredAccessories(filtered);
    }
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/100/100';
    if (image.path) return `https://aqualeads-project.onrender.com${image.path}`;
    if (image.filename) return `https://aqualeads-project.onrender.com/uploads/accessories/${image.filename}`;
    return '/api/placeholder/100/100';
  };

  // Get category label
  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  // Get subcategory label
  const getSubCategoryLabel = (category, value) => {
    if (!value) return '-';
    let options = [];
    switch (category) {
      case 'hardscape': options = HARDSCAPE_SUBTYPES; break;
      case 'filters': options = FILTER_SUBTYPES; break;
      case 'equipments': options = EQUIPMENT_SUBTYPES; break;
      default: return value;
    }
    const subCat = options.find(s => s.value === value);
    return subCat ? subCat.label : value;
  };

  // Open edit modal
  const handleEditClick = (accessory) => {
    setEditingAccessory(accessory);
    setEditFormData({
      name: accessory.name || '',
      category: accessory.category || 'hardscape',
      subCategory: accessory.subCategory || '',
      description: accessory.description || '',
      stock: accessory.stock || '',
      featured: accessory.featured || false,
      addAvailability: accessory.availability !== undefined,
      availability: accessory.availability !== undefined ? accessory.availability : true,
      addPrice: accessory.price !== undefined,
      price: accessory.price || '',
      currency: accessory.currency || 'LKR'
    });
    setNewImage(null);
    setImagePreview('');
    setDeleteCurrentImage(false);
    setEditModal(true);
  };

  // Handle form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset subcategory when category changes
    if (name === 'category') {
      setEditFormData(prev => ({ ...prev, subCategory: '' }));
    }
  };

  // Handle new image upload
  const handleNewImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setNewImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setDeleteCurrentImage(false);
  };

  // Remove new image
  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview('');
  };

  // Mark current image for deletion
  const markImageForDeletion = () => {
    setDeleteCurrentImage(true);
    setNewImage(null);
    setImagePreview('');
  };

  // Undo image deletion
  const undoImageDeletion = () => {
    setDeleteCurrentImage(false);
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name || !editFormData.description) {
      alert('Please fill in name and description');
      return;
    }

    if (editFormData.category !== 'lights' && !editFormData.subCategory) {
      alert('Please select a subcategory');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('category', editFormData.category);
      if (editFormData.subCategory) {
        formData.append('subCategory', editFormData.subCategory);
      }
      formData.append('description', editFormData.description);
      formData.append('featured', editFormData.featured);

      // Only append stock if provided
      if (editFormData.stock !== '') {
        formData.append('stock', editFormData.stock);
      }

      // Only append availability if enabled
      if (editFormData.addAvailability) {
        formData.append('availability', editFormData.availability);
      }

      // Only append price and currency if enabled and price is provided
      if (editFormData.addPrice && editFormData.price !== '') {
        formData.append('price', editFormData.price);
        formData.append('currency', editFormData.currency);
      }

      // Handle image deletion
      if (deleteCurrentImage) {
        formData.append('deleteImage', 'true');
      }

      // Handle new image
      if (newImage) {
        formData.append('image', newImage);
      }

      const res = await fetch(`https://aqualeads-project.onrender.com/api/accessories/${editingAccessory._id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Accessory updated successfully!');
        fetchAllAccessories();
        setEditModal(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to update accessory: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating accessory:', err);
      alert('Server error while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accessory?')) return;

    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/accessories/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setAccessories(prev => prev.filter(a => a._id !== id));
        setFilteredAccessories(prev => prev.filter(a => a._id !== id));
        setSuccessMsg('Accessory deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to delete accessory: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting accessory:', err);
      alert('Server error while deleting.');
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Accessories</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, category, or description..."
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
            <span>Loading accessories...</span>
          </div>
        )}

        {!isLoading && !errorMsg && filteredAccessories.length === 0 && (
          <div className="empty-state">No accessories found.</div>
        )}

        {!isLoading && filteredAccessories.length > 0 && (
          <div className="table-wrapper">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccessories.map((accessory) => (
                  <tr key={accessory._id}>
                    <td>
                      {accessory.image ? (
                        <img 
                          src={getImageUrl(accessory.image)} 
                          alt={accessory.name}
                          className="article-thumbnail"
                          onError={(e) => e.target.src = '/api/placeholder/100/100'}
                        />
                      ) : (
                        <div className="no-image-placeholder">No image</div>
                      )}
                    </td>
                    <td className="font-medium">{accessory.name}</td>
                    <td>{getCategoryLabel(accessory.category)}</td>
                    <td>{getSubCategoryLabel(accessory.category, accessory.subCategory)}</td>
                    <td>{accessory.stock || '-'}</td>
                    <td>
                      {accessory.availability !== undefined ? (
                        <span className={`status-badge ${accessory.availability ? 'status-available' : 'status-unavailable'}`}>
                          {accessory.availability ? 'In Stock' : 'Out of Stock'}
                        </span>
                      ) : (
                        <span className="status-badge">Not Set</span>
                      )}
                    </td>
                    <td>
                      {accessory.featured && <span className="featured-badge">★ Featured</span>}
                    </td>
                    <td>{new Date(accessory.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditClick(accessory)}
                        className="btn-edit"
                        title="Edit Accessory"
                      >
                        <Edit3 className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(accessory._id)}
                        className="btn-delete"
                        title="Delete Accessory"
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
      {editModal && editingAccessory && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Accessory</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="form-input"
                  placeholder="e.g., Dragon Stone"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {editFormData.category !== 'lights' && (
                <div className="form-group">
                  <label>Sub Category *</label>
                  <select
                    name="subCategory"
                    value={editFormData.subCategory}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select --</option>
                    {subtypeOptions.map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  required
                  rows="4"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity (Optional)</label>
                <input
                  type="number"
                  name="stock"
                  value={editFormData.stock}
                  onChange={handleEditChange}
                  min="0"
                  className="form-input"
                  placeholder="Leave empty if not applicable"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="addAvailability"
                    checked={editFormData.addAvailability}
                    onChange={handleEditChange}
                  />
                  <span>Add Availability Status</span>
                </label>
              </div>

              {editFormData.addAvailability && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="availability"
                      checked={editFormData.availability}
                      onChange={handleEditChange}
                    />
                    <span>In Stock</span>
                  </label>
                </div>
              )}

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="addPrice"
                    checked={editFormData.addPrice}
                    onChange={handleEditChange}
                  />
                  <span>Add Price Information</span>
                </label>
              </div>

              {editFormData.addPrice && (
                <>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      name="currency"
                      value={editFormData.currency}
                      onChange={handleEditChange}
                      className="form-input"
                    >
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={editFormData.featured}
                    onChange={handleEditChange}
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              {/* Image Management */}
              <div className="form-section-divider">
                <h3>Product Image</h3>
              </div>

              {/* Current Image */}
              {editingAccessory.image && !deleteCurrentImage && !newImage && (
                <div className="form-group">
                  <label>Current Image</label>
                  <div className="single-image-preview">
                    <img 
                      src={getImageUrl(editingAccessory.image)} 
                      alt={editingAccessory.name}
                      className="edit-image-preview"
                    />
                    <button 
                      type="button" 
                      onClick={markImageForDeletion}
                      className="btn-delete-image"
                    >
                      <Trash2 className="btn-icon-small" /> Remove Image
                    </button>
                  </div>
                </div>
              )}

              {/* Marked for deletion */}
              {deleteCurrentImage && (
                <div className="form-group">
                  <div className="deleted-image-notice">
                    <p>Current image will be deleted</p>
                    <button 
                      type="button" 
                      onClick={undoImageDeletion}
                      className="btn-undo"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {newImage && imagePreview && (
                <div className="form-group">
                  <label>New Image</label>
                  <div className="single-image-preview">
                    <img 
                      src={imagePreview} 
                      alt="New"
                      className="edit-image-preview"
                    />
                    <button 
                      type="button" 
                      onClick={removeNewImage}
                      className="btn-delete-image"
                    >
                      <X className="btn-icon-small" /> Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Upload New Image Button */}
              <div className="form-group">
                <input
                  id="accessoryImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleNewImageUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('accessoryImageInput').click()}
                  className="btn-add-image"
                >
                  <ImageIcon className="btn-icon" /> {newImage ? 'Change Image' : 'Upload New Image'}
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

export default ManageAccessories;