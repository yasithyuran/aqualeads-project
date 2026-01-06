import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Search, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import './Manage.css';

const ManageImEx = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image editing state
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Fetch all ImEx posts
  const fetchAllPosts = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await fetch('http://https://aqualead-project.onrender.com/api/imex/all');
      const data = await response.json();

      if (data.success && Array.isArray(data.posts)) {
        const sorted = data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
        setFilteredPosts(sorted);
      } else {
        setErrorMsg('Failed to load posts.');
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
    fetchAllPosts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(value) ||
        post.type.toLowerCase().includes(value)
      );
      setFilteredPosts(filtered);
    }
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (image.filename) return `http://https://aqualead-project.onrender.com/uploads/${image.filename}`;
    if (image.path) return `http://https://aqualead-project.onrender.com${image.path}`;
    return '/api/placeholder/100/100';
  };

  // Open edit modal
  const handleEditClick = (post) => {
    setEditingPost(post);
    setEditFormData({
      title: post.title,
      shortDescription: post.shortDescription,
      type: post.type
    });
    setNewImages([]);
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

  // Handle new images upload
  const handleNewImagesUpload = (e) => {
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
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title || !editFormData.shortDescription) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', editFormData.title);
      formData.append('shortDescription', editFormData.shortDescription);
      formData.append('type', editFormData.type);

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

      const res = await fetch(`http://https://aqualead-project.onrender.com/api/imex/${editingPost._id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Post updated successfully!');
        fetchAllPosts();
        setEditModal(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to update post: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Server error while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`http://https://aqualead-project.onrender.com/api/imex/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setPosts(prev => prev.filter(p => p._id !== id));
        setFilteredPosts(prev => prev.filter(p => p._id !== id));
        setSuccessMsg('Post deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Failed to delete post: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Server error while deleting.');
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-card">
        <div className="manage-header">
          <h1 className="manage-title">Manage Import/Export Posts</h1>
          <div className="manage-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or type..."
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
            <span>Loading posts...</span>
          </div>
        )}

        {!isLoading && !errorMsg && filteredPosts.length === 0 && (
          <div className="empty-state">No posts found.</div>
        )}

        {!isLoading && filteredPosts.length > 0 && (
          <div className="table-wrapper">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Images</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post._id}>
                    <td>
                      {post.images && post.images.length > 0 ? (
                        <img 
                          src={getImageUrl(post.images[0])} 
                          alt={post.title}
                          className="article-thumbnail"
                          onError={(e) => e.target.src = '/api/placeholder/100/100'}
                        />
                      ) : (
                        <div className="no-image-placeholder">No image</div>
                      )}
                    </td>
                    <td className="font-medium">{post.title}</td>
                    <td className="capitalize">{post.type}</td>
                    <td className="truncate">{post.shortDescription}</td>
                    <td>{post.images?.length || 0}</td>
                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="btn-edit"
                        title="Edit Post"
                      >
                        <Edit3 className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="btn-delete"
                        title="Delete Post"
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
      {editModal && editingPost && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content modal-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Import/Export Post</h2>
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
                <label>Type</label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditChange}
                  className="form-input"
                >
                  <option value="import">Import</option>
                  <option value="export">Export</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="shortDescription"
                  value={editFormData.shortDescription}
                  onChange={handleEditChange}
                  required
                  rows="5"
                  className="form-input"
                />
              </div>

              {/* Current Images */}
              <div className="form-section-divider">
                <h3>Images</h3>
              </div>

              {editingPost.images && editingPost.images.length > 0 && (
                <div className="form-group">
                  <label>Current Images ({editingPost.images.filter(img => !imagesToDelete.includes(img._id)).length})</label>
                  <div className="images-grid">
                    {editingPost.images.map((img, idx) => (
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
                  id="imexImagesInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImagesUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('imexImagesInput').click()}
                  className="btn-add-image"
                >
                  <ImageIcon className="btn-icon" /> Add Images
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

export default ManageImEx;