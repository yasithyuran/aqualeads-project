import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image } from 'lucide-react';

const CATEGORIES = [
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'animal_food', label: 'Animal Food' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'terrarium', label: 'Terrarium Products' },
  { value: 'other', label: 'Other Products' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'IN STOCK', label: 'In Stock' },
  { value: 'OUT OF STOCK', label: 'Out of Stock' },
  { value: 'LIMITED', label: 'Limited Stock' }
];

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Image editing state
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Optional fields state
  const [includePricing, setIncludePricing] = useState(false);
  const [includeAvailability, setIncludeAvailability] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('http://https://aqualead-project.onrender.com/api/products?limit=1000');
      const data = await res.json();
      
      if (data.success) {
        const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sorted);
        setFiltered(sorted);
      } else {
        setErrorMsg('Failed to load products');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) return setFiltered(products);
    setFiltered(products.filter(product => 
      product.name.toLowerCase().includes(term) || 
      product.category.toLowerCase().includes(term) ||
      product.shortDescription.toLowerCase().includes(term)
    ));
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/100/100';
    if (image.filename) return `http://https://aqualead-project.onrender.com/uploads/${image.filename}`;
    if (image.path) return `http://https://aqualead-project.onrender.com${image.path}`;
    return '/api/placeholder/100/100';
  };

  // Get category label
  const getCategoryLabel = (value) => {
    const found = CATEGORIES.find(c => c.value === value);
    return found ? found.label : value;
  };

  // Open edit modal
  const handleEditClick = (product) => {
    setEditingProduct(product);
    
    // Check if product has price and availability
    const hasPrice = product.price !== undefined && product.price !== null;
    const hasAvailability = product.availability !== undefined && product.availability !== null;
    
    setIncludePricing(hasPrice);
    setIncludeAvailability(hasAvailability);
    
    setEditForm({
      name: product.name,
      shortDescription: product.shortDescription,
      availability: product.availability || '',
      category: product.category,
      price: product.price || '',
      currency: product.currency || 'LKR'
    });
    setNewImages([]);
    setImagesToDelete([]);
    setEditModal(true);
  };

  // Form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new images upload
  const handleNewImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check limit
    const currentCount = (editingProduct.images?.length || 0) - imagesToDelete.length + newImages.length;
    if (currentCount + files.length > 5) {
      alert(`Maximum 5 images allowed. You currently have ${currentCount} images.`);
      return;
    }

    const newImgs = [];
    let processedCount = 0;
    
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
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
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large (max 5MB)`);
        }
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
  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.shortDescription) {
      alert('Please fill all required fields');
      return;
    }

    if (editForm.shortDescription.length > 200) {
      alert('Short description must be less than 200 characters');
      return;
    }

    if (includePricing && (!editForm.price || editForm.price === '')) {
      alert('Please enter a price or uncheck "Include Price"');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('shortDescription', editForm.shortDescription);
      formData.append('category', editForm.category);

      // Add price only if included and has value
      if (includePricing && editForm.price && editForm.price !== '') {
        formData.append('price', editForm.price);
        formData.append('currency', editForm.currency);
      } else if (!includePricing) {
        // Send empty to remove price
        formData.append('price', '');
        formData.append('currency', '');
      }

      // Add availability only if included and has value
      if (includeAvailability && editForm.availability) {
        formData.append('availability', editForm.availability);
      } else if (!includeAvailability) {
        // Send empty to remove availability
        formData.append('availability', '');
      }

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

      const res = await fetch(`http://https://aqualead-project.onrender.com/api/products/${editingProduct._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Product updated successfully!');
        fetchProducts();
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

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://https://aqualead-project.onrender.com/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        setFiltered(prev => prev.filter(p => p._id !== id));
        setSuccessMsg('Product deleted!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    card: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' },
    header: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' },
    searchWrapper: { position: 'relative', maxWidth: '400px' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
    searchInput: { width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
    alert: { padding: '12px', borderRadius: '8px', marginBottom: '16px' },
    alertSuccess: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
    alertError: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', fontWeight: '600', fontSize: '14px' },
    td: { padding: '12px', borderBottom: '1px solid #f0f0f0' },
    thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' },
    badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
    badgeInStock: { background: '#d4edda', color: '#155724' },
    badgeLimited: { background: '#fff3cd', color: '#856404' },
    badgeOutOfStock: { background: '#f8d7da', color: '#721c24' },
    btnEdit: { padding: '6px', marginRight: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnDelete: { padding: '6px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee' },
    formGroup: { marginBottom: '20px', padding: '0 20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', resize: 'vertical' },
    optionalSection: { padding: '16px', background: '#f7fafc', borderRadius: '8px', border: '2px dashed #cbd5e0', marginBottom: '20px' },
    checkbox: { width: '18px', height: '18px', marginRight: '10px', cursor: 'pointer' },
    checkboxLabel: { display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer', fontWeight: '600' },
    imagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' },
    imageItem: { position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' },
    gridThumb: { width: '100%', height: '100px', objectFit: 'cover' },
    btnDeleteGrid: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,53,69,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    captionInput: { width: '100%', padding: '6px', border: 'none', borderTop: '1px solid #ddd', fontSize: '12px' },
    modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '20px', borderTop: '1px solid #eee' },
    btnCancel: { padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: '6px', cursor: 'pointer' },
    btnSubmit: { padding: '10px 20px', border: 'none', background: '#007bff', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Manage Products</h1>
          <div style={styles.searchWrapper}>
            <Search style={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search by name, category..." 
              value={searchTerm} 
              onChange={handleSearch} 
              style={styles.searchInput}
            />
          </div>
        </div>

        {successMsg && <div style={{...styles.alert, ...styles.alertSuccess}}>{successMsg}</div>}
        {errorMsg && !loading && <div style={{...styles.alert, ...styles.alertError}}>{errorMsg}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} /> 
            <p>Loading...</p>
          </div>
        ) : (
          filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No products found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Availability</th>
                    <th style={styles.th}>Images</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product._id}>
                      <td style={styles.td}>
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={getImageUrl(product.images[0])} 
                            alt={product.name}
                            style={styles.thumbnail}
                          />
                        ) : (
                          <div style={{ ...styles.thumbnail, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>No image</div>
                        )}
                      </td>
                      <td style={{...styles.td, fontWeight: '500'}}>{product.name}</td>
                      <td style={styles.td}>{getCategoryLabel(product.category)}</td>
                      <td style={{...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{product.shortDescription}</td>
                      <td style={styles.td}>
                        {product.price !== undefined && product.price !== null ? (
                          <span style={{ fontWeight: '600', color: '#2c5f2d' }}>
                            {product.price.toFixed(2)} {product.currency || 'LKR'}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {product.availability ? (
                          <span style={{
                            ...styles.badge,
                            ...(product.availability === 'IN STOCK' ? styles.badgeInStock :
                                product.availability === 'LIMITED' ? styles.badgeLimited :
                                styles.badgeOutOfStock)
                          }}>
                            {product.availability}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>{product.images?.length || 0}</td>
                      <td style={styles.td}>{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleEditClick(product)} style={styles.btnEdit} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} style={styles.btnDelete} title="Delete">
                          <Trash2 size={16} />
                        </button>
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
      {editModal && editingProduct && (
        <div style={styles.modal} onClick={() => setEditModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>Edit Product</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select name="category" value={editForm.category} onChange={handleEditChange} style={styles.input}>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} style={styles.input}/>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Short Description * 
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                    ({editForm.shortDescription?.length || 0}/200)
                  </span>
                </label>
                <textarea 
                  name="shortDescription" 
                  value={editForm.shortDescription} 
                  onChange={handleEditChange} 
                  maxLength="200"
                  rows="3" 
                  style={styles.textarea}
                />
              </div>

              {/* Price Section */}
              <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <div style={styles.optionalSection}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={includePricing}
                      onChange={(e) => setIncludePricing(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>Include Price</span>
                  </label>
                  
                  {includePricing && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={styles.label}>Price *</label>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          style={styles.input}
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Currency</label>
                        <select name="currency" value={editForm.currency} onChange={handleEditChange} style={styles.input}>
                          <option value="LKR">LKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Section */}
              <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <div style={styles.optionalSection}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={includeAvailability}
                      onChange={(e) => setIncludeAvailability(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>Include Availability Status</span>
                  </label>
                  
                  {includeAvailability && (
                    <div>
                      <label style={styles.label}>Availability *</label>
                      <select name="availability" value={editForm.availability} onChange={handleEditChange} style={styles.input}>
                        <option value="">Select availability...</option>
                        {AVAILABILITY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Images Section */}
              <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Images (Max 5)</h3>
              </div>

              {editingProduct.images && editingProduct.images.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Images ({editingProduct.images.filter(img => !imagesToDelete.includes(img._id)).length})</label>
                  <div style={styles.imagesGrid}>
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} style={styles.imageItem}>
                        {imagesToDelete.includes(img._id) ? (
                          <div style={{ padding: '20px', textAlign: 'center', background: '#f8d7da' }}>
                            <p style={{ fontSize: '12px', marginBottom: '8px' }}>Will be deleted</p>
                            <button 
                              type="button" 
                              onClick={() => undoImageDeletion(img._id)}
                              style={{ padding: '4px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={getImageUrl(img)} 
                              alt={img.caption || `Image ${idx + 1}`}
                              style={styles.gridThumb}
                            />
                            {img.caption && <p style={{ padding: '4px', fontSize: '11px', background: '#f9f9f9' }}>{img.caption}</p>}
                            <button 
                              type="button" 
                              onClick={() => markImageForDeletion(img._id)}
                              style={styles.btnDeleteGrid}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Images to Add ({newImages.length})</label>
                  <div style={styles.imagesGrid}>
                    {newImages.map((img, idx) => (
                      <div key={idx} style={styles.imageItem}>
                        <img src={img.preview} alt="New" style={styles.gridThumb} />
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={img.caption}
                          onChange={(e) => updateNewImageCaption(idx, e.target.value)}
                          style={styles.captionInput}
                        />
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(idx)}
                          style={styles.btnDeleteGrid}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images Button */}
              {((editingProduct.images?.length || 0) - imagesToDelete.length + newImages.length) < 5 && (
                <div style={styles.formGroup}>
                  <input
                    id="productImagesInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImagesUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('productImagesInput').click()}
                    style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Image size={18} /> Add Images
                  </button>
                </div>
              )}

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button onClick={handleEditSubmit} style={styles.btnSubmit} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageProducts;