import React, { useState, useMemo } from 'react';

const FISH_SUBTYPES = [
  { value: 'planted_large_tank', label: 'Planted Large Tank Fish' },
  { value: 'marine', label: 'Marine Fish' },
  { value: 'algae_cleaners', label: 'Algae Cleaners' },
  { value: 'snails', label: 'Snails' },
  { value: 'nano_fish', label: 'Nano Fish' },
  { value: 'shrimps', label: 'Shrimps' },
  { value: 'crabs', label: 'Crabs' },
  { value: 'bottom_cleaners', label: 'Bottom Cleaners' },
  { value: 'monster_fish', label: 'Monster Fish' },
  { value: 'export_only', label: 'Export Only Fish' },
  { value: 'exotic_fish', label: 'Exotic Fish' },
  { value: 'other', label: 'Other' },
];

const PLANT_SUBTYPES = [
  { value: 'low_tech', label: 'Low Tech Plants' },
  { value: 'high_tech', label: 'High Tech Plants' },
  { value: 'paludarium', label: 'Paludarium Plants' },
  { value: 'other', label: 'Other' },
];

export default function AddLiveItem() {
  const [form, setForm] = useState({
    name: '',
    itemType: 'fish',
    subType: '',
    price: '',
    currency: '',
    unit: '',
    availability: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const subtypeOptions = useMemo(
    () => (form.itemType === 'fish' ? FISH_SUBTYPES : PLANT_SUBTYPES),
    [form.itemType]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const togglePricing = () => {
    setShowPricing(!showPricing);
    if (showPricing) {
      setForm(prev => ({
        ...prev,
        price: '',
        currency: '',
        unit: ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        currency: 'LKR',
        unit: 'each'
      }));
    }
  };

  const toggleAvailability = () => {
    setShowAvailability(!showAvailability);
    if (showAvailability) {
      setForm(prev => ({ ...prev, availability: null }));
    } else {
      setForm(prev => ({ ...prev, availability: true }));
    }
  };

  const submit = async () => {
    if (!form.subType) return alert('Please select a sub category');
    if (!imageFile) return alert('Please add a photo');

    setLoading(true);
    try {
      const fd = new FormData();
      
      fd.append('name', form.name);
      fd.append('itemType', form.itemType);
      fd.append('subType', form.subType);
      
      if (showPricing && form.price) {
        fd.append('price', form.price);
        fd.append('currency', form.currency);
        fd.append('unit', form.unit);
      }
      
      if (showAvailability && form.availability !== null) {
        fd.append('availability', form.availability);
      }
      
      fd.append('image', imageFile);

      const res = await fetch('http://https://aqualeads-project.onrender.com/api/livestock', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to save');

      alert('Saved!');
      setForm({
        name: '',
        itemType: 'fish',
        subType: '',
        price: '',
        currency: '',
        unit: '',
        availability: null,
      });
      setImageFile(null);
      setPreview('');
      setShowPricing(false);
      setShowAvailability(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a1a' }}>Add Live Stock / Plant</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Item Type</label>
          <select 
            name="itemType" 
            value={form.itemType} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="fish">Fish</option>
            <option value="plant">Plant</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Sub Category</label>
          <select 
            name="subType" 
            value={form.subType} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">-- Select --</option>
            {subtypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="e.g., Galaxy Rasbora" 
            required
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '12px' }}>
            <input 
              type="checkbox" 
              checked={showPricing} 
              onChange={togglePricing}
              style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '500' }}>Add Pricing Information</span>
          </label>

          {showPricing && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563' }}>Price</label>
                <input 
                  name="price" 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563' }}>Currency</label>
                <select 
                  name="currency" 
                  value={form.currency} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563' }}>Unit</label>
                <select 
                  name="unit" 
                  value={form.unit} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="each">Each</option>
                  <option value="pair">Pair</option>
                  <option value="bunch">Bunch</option>
                  <option value="pot">Pot</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '12px' }}>
            <input 
              type="checkbox" 
              checked={showAvailability} 
              onChange={toggleAvailability}
              style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '500' }}>Add Availability Status</span>
          </label>

          {showAvailability && (
            <div style={{ marginLeft: '24px', display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="availability" 
                  checked={form.availability === true} 
                  onChange={() => setForm(prev => ({ ...prev, availability: true }))}
                  style={{ marginRight: '6px' }}
                />
                <span style={{ fontSize: '14px' }}>In Stock</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="availability" 
                  checked={form.availability === false} 
                  onChange={() => setForm(prev => ({ ...prev, availability: false }))}
                  style={{ marginRight: '6px' }}
                />
                <span style={{ fontSize: '14px' }}>Out of Stock</span>
              </label>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImage}
            style={{ display: 'block', marginBottom: '12px' }}
          />
          {preview && (
            <img 
              src={preview} 
              alt="preview" 
              style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
          )}
        </div>

        <button 
          onClick={submit}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </div>
    </div>
  );
}