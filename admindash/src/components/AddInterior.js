import React, { useState } from 'react';
import './AddInterior.css';

const AddInterior = () => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    budget: '',
    shortDescription: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processFiles = (files) => {
    console.log('Processing files:', files.length, files.map(f => f.name));
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    // Limit to 10 images total
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 10) {
      setMessage({ 
        type: 'error', 
        text: `Maximum 10 images allowed. You selected ${files.length} but already have ${imagePreviews.length}.` 
      });
      return;
    }

    // Validate file sizes (5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `${oversizedFiles.length} image(s) are too large. Maximum 5MB per image.` 
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `${invalidFiles.length} file(s) are not valid image types.` 
      });
      return;
    }

    // Update files and create previews
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      caption: ''
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setMessage({ 
      type: 'success', 
      text: `${files.length} image(s) added successfully! Total: ${newFiles.length}` 
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = ''; // Clear the input
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files.length, files.map(f => f.name));
    
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setMessage({ type: 'error', text: 'No valid image files found in dropped files.' });
      return;
    }
    
    if (imageFiles.length !== files.length) {
      setMessage({ 
        type: 'warning', 
        text: `Only ${imageFiles.length} of ${files.length} files were images and will be processed.` 
      });
    }

    processFiles(imageFiles);
  };

  const handleCaptionChange = (index, caption) => {
    setImagePreviews(prev => 
      prev.map((preview, i) => 
        i === index ? { ...preview, caption } : preview
      )
    );
  };

  const removeImage = (index) => {
    // Clean up the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Starting form submission...');
    console.log('Form data:', formData);
    console.log('Image files:', imageFiles.length);
    console.log('Image previews:', imagePreviews.length);
    
    if (!formData.title || !formData.location || !formData.shortDescription) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title.trim());
      submitData.append('location', formData.location.trim());
      submitData.append('budget', formData.budget.trim());
      submitData.append('shortDescription', formData.shortDescription.trim());

      // Add images
      imageFiles.forEach((file, index) => {
        console.log(`Adding image ${index + 1}:`, file.name, file.size);
        submitData.append('images', file);
      });

      // Add captions - Send as individual form entries (not JSON)
      imagePreviews.forEach((preview, index) => {
        console.log(`Adding caption ${index + 1}:`, preview.caption);
        submitData.append('imageCaptions', preview.caption || '');
      });

      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('Sending request to backend...');
      
      const response = await fetch('http://localhost:5000/api/interiors', {
        method: 'POST',
        body: submitData
        // Don't set Content-Type header - let browser set it for FormData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Interior project added successfully!' });
        
        // Clean up object URLs to prevent memory leaks
        imagePreviews.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
        // Reset form
        setFormData({
          title: '',
          location: '',
          budget: '',
          shortDescription: ''
        });
        setImageFiles([]);
        setImagePreviews([]);
        
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
        
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to add interior project' 
        });
      }
    } catch (error) {
      console.error('Frontend error:', error);
      setMessage({ 
        type: 'error', 
        text: `Network error: ${error.message}. Please check if the server is running.` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []); // Empty dependency array for cleanup on unmount only

  return (
    <div className="add-interior-page">
      <div className="admin-header">
        <h1>Add New Interior Project</h1>
        <p>Create a new interior design showcase</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="interior-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Modern Living Room Design"
            required
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Colombo, Sri Lanka"
            required
          />
        </div>

        {/* Budget */}
        <div className="form-group">
          <label htmlFor="budget">Budget</label>
          <input
            type="text"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            placeholder="e.g., LKR 500,000 - 1,000,000"
          />
        </div>

        {/* Short Description */}
        <div className="form-group">
          <label htmlFor="shortDescription">Short Description *</label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            placeholder="Brief description of the interior project..."
            rows="4"
            required
          />
        </div>

        {/* Images */}
        <div className="form-group">
          <label htmlFor="images">Project Images</label>
          
          {/* Drag and Drop Area */}
          <div
            className={`drag-drop-area ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#007bff' : '#ddd'}`,
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '15px',
              backgroundColor: dragOver ? '#f8f9ff' : '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => document.getElementById('images').click()}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>
              {dragOver ? '📂' : '🖼️'}
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: dragOver ? '#007bff' : '#333' }}>
              {dragOver ? 'Drop your images here!' : 'Select Multiple Images'}
            </h3>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              Click here or drag & drop images<br />
              <strong>Hold Ctrl/Cmd + click to select multiple files</strong><br />
              Max 10 images, 5MB each • JPG, PNG, GIF, WebP
            </p>
          </div>

          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="file-input"
            style={{ display: 'none' }}
            key={`images-${imageFiles.length}`} // Force re-render
          />

          {imageFiles.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p className="file-info" style={{ color: 'green', fontWeight: 'bold', margin: '10px 0' }}>
                ✅ {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
              </p>
              
              {/* Add more images button */}
              {imageFiles.length < 10 && (
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('additional-images').click()}
                    className="add-more-btn"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    + Add More Images
                  </button>
                  <input
                    type="file"
                    id="additional-images"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAdditionalImages}
                    style={{ display: 'none' }}
                    key={`additional-${imageFiles.length}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="image-previews">
            <h3>Image Previews ({imagePreviews.length} images)</h3>
            <div className="preview-grid">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview.file.name}-${index}`} className="preview-item">
                  <div className="preview-image-container">
                    <img 
                      src={preview.url} 
                      alt={`Preview ${index + 1}`} 
                      className="preview-image"
                    />
                    <span className="image-number">{index + 1}</span>
                  </div>
                  <div className="preview-controls">
                    <input
                      type="text"
                      placeholder="Image caption (optional)"
                      value={preview.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="caption-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-btn"
                      title="Remove this image"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading 
              ? 'Adding Project...' 
              : `Add Interior Project${imageFiles.length > 0 ? ` (${imageFiles.length} images)` : ''}`
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInterior;