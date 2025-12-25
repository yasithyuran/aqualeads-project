import React, { useState } from 'react';
import './ArticleForm.css'; // Reusing your existing CSS

function AddImEx() {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    type: 'import' // import or export
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { value: 'import', label: 'Import' },
    { value: 'export', label: 'Export' }
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          setImages(prev => [...prev, { file, preview: ev.target.result, caption: '' }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = index => setImages(prev => prev.filter((_, i) => i !== index));
  const updateImageCaption = (index, caption) =>
    setImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
      images.forEach(img => formDataToSend.append('images', img.file));
      const captions = images.map(img => img.caption);
      formDataToSend.append('captions', JSON.stringify(captions));

      const res = await fetch('http://localhost:5000/api/imex', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await res.json();
      if (result.success) {
        alert('Import/Export post added successfully!');
        setFormData({ title: '', shortDescription: '', type: 'import' });
        setImages([]);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add import/export post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-form-container">
      <div className="article-form-wrapper">
        <div className="article-form-card">
          <div className="article-form-header">
            <h2 className="article-form-title">Add Import/Export Post</h2>
          </div>

          {/* Type Selection */}
          <div className="form-section">
            <label className="form-label">Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange} className="form-select">
              {postTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label">Title</label>
            <input 
              className="form-input" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              placeholder="e.g., Aquarium Fish Import from Thailand"
              required 
            />
          </div>

          {/* Short Description */}
          <div className="form-section">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              name="shortDescription" 
              value={formData.shortDescription} 
              onChange={handleInputChange} 
              placeholder="Brief description of the import/export activity..."
              rows="4"
              required 
            />
          </div>

          {/* Images */}
          <div className="form-section">
            <label className="form-label">Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="file-upload-input" 
            />
            {images.length > 0 && (
              <div className="image-grid">
                {images.map((img, i) => (
                  <div key={i} className="image-item">
                    <img src={img.preview} alt="" className="image-preview" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)} 
                      className="image-remove-btn"
                    >
                      X
                    </button>
                    <input 
                      placeholder="Image caption (optional)" 
                      value={img.caption} 
                      onChange={e => updateImageCaption(i, e.target.value)} 
                      className="image-caption-input" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="submit-section">
            <button 
              type="submit" 
              disabled={loading} 
              className="submit-btn" 
              onClick={handleSubmit}
            >
              {loading ? 'Adding...' : 'Add Import/Export Post'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddImEx;