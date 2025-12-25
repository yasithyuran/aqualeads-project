import React, { useState, useMemo } from 'react';
import './AdminLive.css';

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

export default function AddAriums() {
  const [form, setForm] = useState({
    title: '',
    mainCategory: 'aquarium',
    subCategory: '',
    subSubCategory: '',
    subSubSubCategory: '',
    type: 'gallery', // gallery or project
    description: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic options based on selections
  const showAquariumSub = form.mainCategory === 'aquarium';
  const showFreshwaterSub = form.mainCategory === 'aquarium' && form.subCategory === 'freshwater';
  const showPlantedSub = form.mainCategory === 'aquarium' && 
                          form.subCategory === 'freshwater' && 
                          form.subSubCategory === 'planted';
  const showAquascapingSub = form.mainCategory === 'aquarium' && 
                              form.subCategory === 'freshwater' && 
                              form.subSubCategory === 'aquascaping';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
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

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
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

    // Add to existing files
    setImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return alert('Please enter a title');
    }

    if (imageFiles.length === 0) {
      return alert('Please add at least one image');
    }

    // Validate category selections based on hierarchy
    if (showAquariumSub && !form.subCategory) {
      return alert('Please select Marine or Fresh Water');
    }
    if (showFreshwaterSub && !form.subSubCategory) {
      return alert('Please select a freshwater type');
    }
    if (showPlantedSub && !form.subSubSubCategory) {
      return alert('Please select a planted maintenance level');
    }
    if (showAquascapingSub && !form.subSubSubCategory) {
      return alert('Please select an aquascaping tech level');
    }

    setLoading(true);

    try {
      const fd = new FormData();
      
      // Add form fields
      fd.append('title', form.title);
      fd.append('mainCategory', form.mainCategory);
      fd.append('type', form.type);
      fd.append('description', form.description);
      
      // Add subcategories if they exist
      if (form.subCategory) fd.append('subCategory', form.subCategory);
      if (form.subSubCategory) fd.append('subSubCategory', form.subSubCategory);
      if (form.subSubSubCategory) fd.append('subSubSubCategory', form.subSubSubCategory);

      // Add all images
      imageFiles.forEach((file, index) => {
        fd.append('images', file);
      });

      const res = await fetch('http://localhost:5000/api/ariums', {
        method: 'POST',
        body: fd,
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server did not return valid JSON. Check server logs.');
      }

      if (!json.success) throw new Error(json.message || 'Failed to save');

      alert('Arium saved successfully!');

      // Reset form
      setForm({
        title: '',
        mainCategory: 'aquarium',
        subCategory: '',
        subSubCategory: '',
        subSubSubCategory: '',
        type: 'gallery',
        description: '',
      });
      setImageFiles([]);
      setPreviews([]);
      
      // Reset file input
      const fileInput = document.getElementById('ariumImages');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-live-wrap">
      <h2>Add Arium</h2>
      <form onSubmit={submit} className="admin-live-form">

        <div className="row">
          <label>Title *</label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="e.g., Tropical Marine Paradise" 
            required 
          />
        </div>

        <div className="row">
          <label>Main Category *</label>
          <select name="mainCategory" value={form.mainCategory} onChange={handleChange}>
            {MAIN_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Aquarium Subcategory: Marine or Freshwater */}
        {showAquariumSub && (
          <div className="row">
            <label>Aquarium Type *</label>
            <select name="subCategory" value={form.subCategory} onChange={handleChange}>
              <option value="">-- Select Type --</option>
              {AQUARIUM_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Freshwater Subcategory: Biotope, Planted, Aquascaping */}
        {showFreshwaterSub && (
          <div className="row">
            <label>Fresh Water Type *</label>
            <select name="subSubCategory" value={form.subSubCategory} onChange={handleChange}>
              <option value="">-- Select Type --</option>
              {FRESHWATER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Planted Subcategory: Zero, High, Low Maintain */}
        {showPlantedSub && (
          <div className="row">
            <label>Planted Maintenance *</label>
            <select name="subSubSubCategory" value={form.subSubSubCategory} onChange={handleChange}>
              <option value="">-- Select Maintenance Level --</option>
              {PLANTED_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Aquascaping Subcategory: High Tech, Low Tech */}
        {showAquascapingSub && (
          <div className="row">
            <label>Aquascaping Tech Level *</label>
            <select name="subSubSubCategory" value={form.subSubSubCategory} onChange={handleChange}>
              <option value="">-- Select Tech Level --</option>
              {AQUASCAPING_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="row">
          <label>Type *</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="gallery">Gallery</option>
            <option value="project">Project</option>
          </select>
        </div>

        <div className="row">
          <label>Description</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            rows="4" 
            placeholder="Add details about this arium..."
          />
        </div>

        <div className="row">
          <label>Images * (Multiple)</label>
          <input 
            id="ariumImages"
            type="file" 
            accept="image/*" 
            onChange={handleImages} 
            multiple
          />
          
          {previews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '12px', 
              marginTop: '14px' 
            }}>
              {previews.map((preview, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img 
                    src={preview} 
                    alt={`preview-${idx}`} 
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #eee'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(244, 67, 54, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Arium'}
        </button>

      </form>
    </div>
  );
}