import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image editing state
  const [newFrontPic, setNewFrontPic] = useState(null);
  const [newFrontPicPreview, setNewFrontPicPreview] = useState('');
  const [frontPicCaption, setFrontPicCaption] = useState('');
  const [deleteFrontPic, setDeleteFrontPic] = useState(false);
  
  // Additional images state
  const [newAdditionalImages, setNewAdditionalImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Fetch all articles
  const fetchAllArticles = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await fetch('https://aqualeads-project.onrender.com/api/articles');
      const data = await response.json();

      if (data.success && Array.isArray(data.articles)) {
        const sorted = data.articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setArticles(sorted);
        setFilteredArticles(sorted);
      } else {
        setErrorMsg('Failed to load articles.');
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
    fetchAllArticles();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(value) ||
        article.category.toLowerCase().includes(value)
      );
      setFilteredArticles(filtered);
    }
  };

  // Get image URL helper
  const getImageUrl = (article) => {
    if (article.frontPic && article.frontPic.filename) {
      return `https://aqualeads-project.onrender.com/uploads/${article.frontPic.filename}`;
    }
    if (article.frontPic && article.frontPic.path) {
      return `https://aqualeads-project.onrender.com${article.frontPic.path}`;
    }
    return '/api/placeholder/100/100';
  };

  const getAdditionalImageUrl = (image) => {
    if (image.filename) return `https://aqualeads-project.onrender.com/uploads/${image.filename}`;
    if (image.path) return `https://aqualeads-project.onrender.com${image.path}`;
    return '/api/placeholder/100/100';
  };

  // Open edit modal
  const handleEditClick = (article) => {
    setEditingArticle(article);
    setEditFormData({
      title: article.title,
      shortDescription: article.shortDescription,
      mainDescription: article.mainDescription,
      category: article.category
    });
    setNewFrontPic(null);
    setNewFrontPicPreview('');
    setFrontPicCaption(article.frontPic?.caption || '');
    setDeleteFrontPic(false);
    setNewAdditionalImages([]);
    setImagesToDelete([]);
    setEditModal(true);
  };

  // Handle form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle front pic upload
  const handleFrontPicUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewFrontPic(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewFrontPicPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      setDeleteFrontPic(false);
    }
  };

  // Delete front pic
  const handleDeleteFrontPic = () => {
    setDeleteFrontPic(true);
    setNewFrontPic(null);
    setNewFrontPicPreview('');
    setFrontPicCaption('');
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = (e) => {
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
            setNewAdditionalImages(prev => [...prev, ...newImgs]);
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

  // Remove new image before upload
  const removeNewAdditionalImage = (index) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update new image caption
  const updateNewImageCaption = (index, caption) => {
    setNewAdditionalImages(prev => 
      prev.map((img, i) => i === index ? { ...img, caption } : img)
    );
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title || !editFormData.shortDescription || !editFormData.mainDescription) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('shortDescription', editFormData.shortDescription);
      formData.append('mainDescription', editFormData.mainDescription);
      formData.append('category', editFormData.category);

      // Handle front pic
      if (deleteFrontPic) {
        formData.append('deleteFrontPic', 'true');
      } else if (newFrontPic) {
        formData.append('frontPic', newFrontPic);
        formData.append('frontPicCaption', frontPicCaption);
      }

      // Handle additional images
      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      if (newAdditionalImages.length > 0) {
        newAdditionalImages.forEach(img => {
          formData.append('images', img.file);
        });
        const captions = newAdditionalImages.map(img => img.caption);
        formData.append('captions', JSON.stringify(captions));
      }

      const res = await fetch(`https://aqualeads-project.onrender.com/api/articles/${editingArticle._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Article updated successfully!');
        fetchAllArticles();
        setEditModal(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to update article: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating article:', err);
      alert('Server error while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/articles/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setArticles(prev => prev.filter(a => a._id !== id));
        setFilteredArticles(prev => prev.filter(a => a._id !== id));
        setSuccessMsg('Article deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to delete article: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Server error while deleting.');
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Articles</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or category..."
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
            <span>Loading articles...</span>
          </div>
        )}

        {!isLoading && !errorMsg && filteredArticles.length === 0 && (
          <div className="empty-state">No articles found.</div>
        )}

        {!isLoading && filteredArticles.length > 0 && (
          <div className="table-wrapper">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article._id}>
                    <td>
                      <img 
                        src={getImageUrl(article)} 
                        alt={article.title}
                        className="article-thumbnail"
                        onError={(e) => e.target.src = '/api/placeholder/100/100'}
                      />
                    </td>
                    <td className="font-medium">{article.title}</td>
                    <td className="capitalize">{article.category}</td>
                    <td className="truncate">{article.shortDescription}</td>
                    <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditClick(article)}
                        className="btn-edit"
                        title="Edit Article"
                      >
                        <Edit3 className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="btn-delete"
                        title="Delete Article"
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
      {editModal && editingArticle && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Article</h2>
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
                <label>Category</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  <option value="education">Education</option>
                  <option value="conservation">Conservation</option>
                  <option value="ariums">Ariums</option>
                </select>
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea
                  name="shortDescription"
                  value={editFormData.shortDescription}
                  onChange={handleEditChange}
                  required
                  rows="3"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Main Description *</label>
                <textarea
                  name="mainDescription"
                  value={editFormData.mainDescription}
                  onChange={handleEditChange}
                  required
                  rows="5"
                  className="form-input"
                />
              </div>

              {/* Front Picture Section */}
              <div className="form-section-divider">
                <h3>Front Picture (Card Display)</h3>
              </div>

              {editingArticle.frontPic && !deleteFrontPic && !newFrontPicPreview && (
                <div className="form-group">
                  <label>Current Front Picture</label>
                  <div className="image-with-actions">
                    <img 
                      src={getImageUrl(editingArticle)} 
                      alt="Current front"
                      className="current-image-preview"
                    />
                    <div className="image-actions">
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('frontPicInput').click()}
                        className="btn-update"
                      >
                        <Upload className="btn-icon" /> Update
                      </button>
                      <button 
                        type="button" 
                        onClick={handleDeleteFrontPic}
                        className="btn-delete-img"
                      >
                        <Trash2 className="btn-icon" /> Delete
                      </button>
                    </div>
                    {editingArticle.frontPic.caption && (
                      <p className="image-caption-text">{editingArticle.frontPic.caption}</p>
                    )}
                  </div>
                </div>
              )}

              {deleteFrontPic && !newFrontPicPreview && (
                <div className="form-group">
                  <div className="deleted-notice">
                    Front picture will be deleted when you save changes.
                    <button 
                      type="button" 
                      onClick={() => setDeleteFrontPic(false)}
                      className="btn-undo"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              )}

              {newFrontPicPreview && (
                <div className="form-group">
                  <label>New Front Picture</label>
                  <div className="image-with-actions">
                    <img src={newFrontPicPreview} alt="New front" className="current-image-preview" />
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewFrontPic(null);
                        setNewFrontPicPreview('');
                        setFrontPicCaption('');
                      }}
                      className="btn-delete-img"
                    >
                      <X className="btn-icon" /> Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Image caption (optional)"
                    value={frontPicCaption}
                    onChange={(e) => setFrontPicCaption(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '10px' }}
                  />
                </div>
              )}

              <input
                id="frontPicInput"
                type="file"
                accept="image/*"
                onChange={handleFrontPicUpload}
                style={{ display: 'none' }}
              />

              {!editingArticle.frontPic && !newFrontPicPreview && (
                <div className="form-group">
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('frontPicInput').click()}
                    className="btn-add-image"
                  >
                    <ImageIcon className="btn-icon" /> Add Front Picture
                  </button>
                </div>
              )}

              {/* Additional Images Section */}
              <div className="form-section-divider">
                <h3>Additional Images (Slideshow)</h3>
              </div>

              {editingArticle.images && editingArticle.images.length > 0 && (
                <div className="form-group">
                  <label>Current Additional Images ({editingArticle.images.filter(img => !imagesToDelete.includes(img._id)).length})</label>
                  <div className="images-grid">
                    {editingArticle.images.map((img, idx) => (
                      !imagesToDelete.includes(img._id) && (
                        <div key={idx} className="grid-image-item">
                          <img 
                            src={getAdditionalImageUrl(img)} 
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
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {newAdditionalImages.length > 0 && (
                <div className="form-group">
                  <label>New Images to Add ({newAdditionalImages.length})</label>
                  <div className="images-grid">
                    {newAdditionalImages.map((img, idx) => (
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
                          onClick={() => removeNewAdditionalImage(idx)}
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
                  id="additionalImagesInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAdditionalImagesUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('additionalImagesInput').click()}
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

export default ManageArticles;