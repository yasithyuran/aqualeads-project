import React, { useState } from 'react';
import './ArticleForm.css';

function AddArticles() {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    mainDescription: '',
    category: 'education'
  });
  const [frontPic, setFrontPic] = useState(null);
  const [frontPicCaption, setFrontPicCaption] = useState('');
  const [images, setImages] = useState([]);
  const [urls, setUrls] = useState([{ title: '', link: '', description: '' }]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'education', label: 'Education' },
    { value: 'conservation', label: 'Conservation' },
    { value: 'ariums', label: 'Ariums' }
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFrontPicUpload = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        setFrontPic({ file, preview: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFrontPic = () => {
    setFrontPic(null);
    setFrontPicCaption('');
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

  const addUrl = () => setUrls(prev => [...prev, { title: '', link: '', description: '' }]);
  const removeUrl = index => setUrls(prev => prev.filter((_, i) => i !== index));
  const updateUrl = (index, field, value) =>
    setUrls(prev => prev.map((url, i) => i === index ? { ...url, [field]: value } : url));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
      
      if (frontPic) {
        formDataToSend.append('frontPic', frontPic.file);
        formDataToSend.append('frontPicCaption', frontPicCaption);
      }
      
      images.forEach(img => formDataToSend.append('images', img.file));
      const captions = images.map(img => img.caption);
      formDataToSend.append('captions', JSON.stringify(captions));
      const validUrls = urls.filter(url => url.link.trim() !== '');
      formDataToSend.append('urls', JSON.stringify(validUrls));

      const res = await fetch('https://aqualeads-project.onrender.com/api/articles', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await res.json();
      if (result.success) {
        alert('Article added successfully!');
        setFormData({ title: '', shortDescription: '', mainDescription: '', category: 'education' });
        setFrontPic(null);
        setFrontPicCaption('');
        setImages([]);
        setUrls([{ title: '', link: '', description: '' }]);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-form-container">
      <div className="article-form-wrapper">
        <div className="article-form-card">
          <div className="article-form-header">
            <h2 className="article-form-title">Add New Article</h2>
          </div>

          {/* Category */}
          <div className="form-section">
            <label className="form-label">Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
              {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label">Title</label>
            <input className="form-input" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>

          {/* Short Description */}
          <div className="form-section">
            <label className="form-label">Short Description</label>
            <textarea className="form-textarea" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} required />
          </div>

          {/* Main Description */}
          <div className="form-section">
            <label className="form-label">Main Description</label>
            <textarea className="form-textarea" name="mainDescription" value={formData.mainDescription} onChange={handleInputChange} required />
          </div>

          {/* Front Picture */}
          <div className="form-section">
            <label className="form-label">Front Picture (Card Display)</label>
            <input type="file" accept="image/*" onChange={handleFrontPicUpload} className="file-upload-input" />
            {frontPic && (
              <div className="image-grid">
                <div className="image-item">
                  <img src={frontPic.preview} alt="" className="image-preview" />
                  <button type="button" onClick={removeFrontPic} className="image-remove-btn">X</button>
                  <input placeholder="Caption" value={frontPicCaption} onChange={e => setFrontPicCaption(e.target.value)} className="image-caption-input" />
                </div>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div className="form-section">
            <label className="form-label">Additional Images (Slideshow)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-upload-input" />
            {images.length > 0 && (
              <div className="image-grid">
                {images.map((img, i) => (
                  <div key={i} className="image-item">
                    <img src={img.preview} alt="" className="image-preview" />
                    <button type="button" onClick={() => removeImage(i)} className="image-remove-btn">X</button>
                    <input placeholder="Caption" value={img.caption} onChange={e => updateImageCaption(i, e.target.value)} className="image-caption-input" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="form-section">
            <div className="url-section-header">
              <label className="form-label">Related URLs</label>
              <button type="button" onClick={addUrl} className="add-url-btn">Add URL</button>
            </div>
            {urls.map((url, i) => (
              <div key={i} className="url-item">
                <input placeholder="Title" value={url.title} onChange={e => updateUrl(i, 'title', e.target.value)} className="form-input" />
                <input placeholder="Link" value={url.link} onChange={e => updateUrl(i, 'link', e.target.value)} className="form-input" />
                <div className="url-description-row">
                  <input placeholder="Description" value={url.description} onChange={e => updateUrl(i, 'description', e.target.value)} className="form-input url-description-input" />
                  {urls.length > 1 && <button type="button" onClick={() => removeUrl(i)} className="remove-url-btn">X</button>}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="submit-section">
            <button type="submit" disabled={loading} className="submit-btn" onClick={handleSubmit}>
              {loading ? 'Adding...' : 'Add Article'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddArticles;