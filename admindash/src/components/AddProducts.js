import React, { useState } from 'react';

function AddProducts() {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    price: '',
    currency: 'LKR',
    availability: '',
    category: 'fertilizer',
    includePricing: false,
    includeAvailability: false
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'animal_food', label: 'Animal Food' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'terrarium', label: 'Terrarium Products' },
    { value: 'other', label: 'Other Products' }
  ];

  const availabilityOptions = [
    { value: 'IN STOCK', label: 'In Stock' },
    { value: 'OUT OF STOCK', label: 'Out of Stock' },
    { value: 'LIMITED', label: 'Limited Stock' }
  ];

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setMessage({
        type: 'error',
        text: `Maximum 5 images allowed. You have ${images.length} and trying to add ${files.length} more.`
      });
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setMessage({
        type: 'error',
        text: errors.join(', ')
      });
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => [...prev, { 
          file, 
          preview: ev.target.result, 
          caption: '' 
        }]);
      };
      reader.readAsDataURL(file);
    });

    setMessage({
      type: 'success',
      text: `${validFiles.length} image(s) added successfully!`
    });
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateImageCaption = (index, caption) =>
    setImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));

  const validateForm = () => {
    const { name, shortDescription, includePricing, price } = formData;
    
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return false;
    }
    
    if (!shortDescription.trim()) {
      setMessage({ type: 'error', text: 'Short description is required' });
      return false;
    }
    
    if (shortDescription.length > 200) {
      setMessage({ type: 'error', text: 'Short description must be less than 200 characters' });
      return false;
    }

    if (includePricing && (!price || price.trim() === '')) {
      setMessage({ type: 'error', text: 'Please enter a price or uncheck "Include Price"' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      
      console.log('Form data being sent:', formData);
      console.log('Images being sent:', images.length);

      // Add required fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('shortDescription', formData.shortDescription.trim());
      formDataToSend.append('category', formData.category);
      
      // Add price only if includePricing is checked and price is provided
      if (formData.includePricing && formData.price && formData.price.trim() !== '') {
        formDataToSend.append('price', formData.price);
        formDataToSend.append('currency', formData.currency);
      }
      
      // Add availability only if includeAvailability is checked and availability is selected
      if (formData.includeAvailability && formData.availability) {
        formDataToSend.append('availability', formData.availability);
      }
      
      // Add images
      images.forEach((img, index) => {
        console.log(`Adding image ${index + 1}:`, img.file.name);
        formDataToSend.append('images', img.file);
      });
      
      // Add image captions as JSON string
      const captions = images.map(img => img.caption);
      formDataToSend.append('captions', JSON.stringify(captions));

      // Debug FormData
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('Sending request to /api/products...');

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('Response status:', res.status);
      const result = await res.json();
      console.log('Response result:', result);
      
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Product added successfully!' });
        
        // Reset form
        setFormData({
          name: '',
          shortDescription: '',
          price: '',
          currency: 'LKR',
          availability: '',
          category: 'fertilizer',
          includePricing: false,
          includeAvailability: false
        });
        setImages([]);
        
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to add product' 
        });
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setMessage({ 
        type: 'error', 
        text: `Network error: ${err.message}. Please check if the server is running.` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '40px'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '8px'
            }}>Add New Product</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Add a new product to your catalog
            </p>
          </div>

          {message.text && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#d4edda' : 
                             message.type === 'error' ? '#f8d7da' : '#fff3cd',
              color: message.type === 'success' ? '#155724' : 
                     message.type === 'error' ? '#721c24' : '#856404',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : 
                                 message.type === 'error' ? '#f5c6cb' : '#ffeaa7'}`
            }}>
              {message.text}
            </div>
          )}

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
            />
          </div>

          {/* Short Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Short Description *
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                ({formData.shortDescription.length}/200 characters)
              </span>
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="Brief description of the product"
              maxLength="200"
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Price Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e0'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="includePricing"
                checked={formData.includePricing}
                onChange={handleInputChange}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontWeight: '600', color: '#333' }}>Include Price</span>
            </label>
            
            {formData.includePricing && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '14px'
                  }}>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '14px'
                  }}>Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e0'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="includeAvailability"
                checked={formData.includeAvailability}
                onChange={handleInputChange}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontWeight: '600', color: '#333' }}>Include Availability Status</span>
            </label>
            
            {formData.includeAvailability && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>Availability *</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select availability...</option>
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Images */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>Product Images (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              disabled={images.length >= 5}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: images.length >= 5 ? 'not-allowed' : 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Supported formats: JPG, PNG, GIF, WEBP (Max 5MB each)
              {images.length > 0 && ` • ${images.length}/5 images selected`}
            </p>
            
            {images.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '15px', 
                marginTop: '15px' 
              }}>
                {images.map((img, i) => (
                  <div key={i} style={{ 
                    position: 'relative', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    overflow: 'hidden' 
                  }}>
                    <img
                      src={img.preview}
                      alt={`Product preview ${i + 1}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        lineHeight: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      placeholder="Image caption (optional)"
                      value={img.caption}
                      onChange={e => updateImageCaption(i, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        borderTop: '2px solid #e2e8f0',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading 
              ? 'Adding Product...' 
              : `Add Product${images.length > 0 ? ` (${images.length} images)` : ''}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProducts;