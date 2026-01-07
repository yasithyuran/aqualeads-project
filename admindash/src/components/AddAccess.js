import React, { useState, useMemo } from 'react';
import './AdminLive.css';

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

export default function AddAccess() {
  const [form, setForm] = useState({
    name: '',
    category: 'hardscape',
    subCategory: '',
    description: '',
    stock: '',
    featured: false,
    price: '',
    currency: 'LKR',
    addAvailability: false,
    availability: true,
    addPrice: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const subtypeOptions = useMemo(() => {
    switch (form.category) {
      case 'hardscape': return HARDSCAPE_SUBTYPES;
      case 'filters': return FILTER_SUBTYPES;
      case 'equipments': return EQUIPMENT_SUBTYPES;
      case 'lights': return [];
      default: return [];
    }
  }, [form.category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'category') setForm(prev => ({ ...prev, subCategory: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image');
    if (file.size > 5 * 1024 * 1024) return alert('Image size should be < 5MB');

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.category !== 'lights' && !form.subCategory) {
      return alert('Please select a subcategory');
    }
    if (!imageFile) return alert('Please add a photo');

    setLoading(true);

    try {
      const fd = new FormData();
      
      // Add required fields
      fd.append('name', form.name);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('featured', form.featured);
      
      // Add optional subCategory
      if (form.subCategory) {
        fd.append('subCategory', form.subCategory);
      }
      
      // Add stock only if provided
      if (form.stock) {
        fd.append('stock', form.stock);
      }
      
      // Add availability only if user chose to add it
      if (form.addAvailability) {
        fd.append('availability', form.availability);
      }
      
      // Add price and currency only if user chose to add price
      if (form.addPrice && form.price) {
        fd.append('price', form.price);
        fd.append('currency', form.currency);
      }
      
      fd.append('image', imageFile);

      const res = await fetch('https://aqualeads-project.onrender.com/api/accessories', {
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

      alert('Accessory saved successfully!');

      // Reset form
      setForm({
        name: '',
        category: 'hardscape',
        subCategory: '',
        description: '',
        stock: '',
        featured: false,
        price: '',
        currency: 'LKR',
        addAvailability: false,
        availability: true,
        addPrice: false,
      });
      setImageFile(null);
      setPreview('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-live-wrap">
      <h2>Add Aquarium Accessory</h2>
      <div className="admin-live-form" onSubmit={submit}>

        <div className="row">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="hardscape">Hardscape Items</option>
            <option value="lights">Lights</option>
            <option value="filters">Filters</option>
            <option value="equipments">Equipments</option>
          </select>
        </div>

        {form.category !== 'lights' && (
          <div className="row">
            <label>Sub Category</label>
            <select name="subCategory" value={form.subCategory} onChange={handleChange}>
              <option value="">-- Select --</option>
              {subtypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <div className="row">
          <label>Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Dragon Stone" required />
        </div>

        <div className="row">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" required />
        </div>

        <div className="row two">
          <div>
            <label>Stock Quantity (Optional)</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="Leave empty if not applicable" />
          </div>
        </div>

        <div className="row check">
          <label>
            <input type="checkbox" name="addPrice" checked={form.addPrice} onChange={handleChange} />
            &nbsp; Add Price Information
          </label>
        </div>

        {form.addPrice && (
          <div className="row two">
            <div>
              <label>Price</label>
              <input 
                name="price" 
                type="number" 
                min="0" 
                step="0.01"
                value={form.price} 
                onChange={handleChange} 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange}>
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        )}

        <div className="row check">
          <label>
            <input type="checkbox" name="addAvailability" checked={form.addAvailability} onChange={handleChange} />
            &nbsp; Add Availability Status
          </label>
        </div>

        {form.addAvailability && (
          <div className="row check">
            <label>
              <input type="checkbox" name="availability" checked={form.availability} onChange={handleChange} />
              &nbsp; In Stock
            </label>
          </div>
        )}

        <div className="row check">
          <label>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            &nbsp; Featured Product
          </label>
        </div>

        <div className="row">
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImage} />
          {preview && <img src={preview} alt="preview" className="preview" />}
        </div>

        <button className="save-btn" disabled={loading} onClick={submit}>
          {loading ? 'Saving...' : 'Save Accessory'}
        </button>

      </div>
    </div>
  );
}