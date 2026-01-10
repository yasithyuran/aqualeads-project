import React, { useEffect, useState } from 'react';
import './LiveGrid.css';

const FILTER_SUBS = [
  { value: 'all', label: 'All Filters' },
  { value: 'hangon_back', label: 'Hang-on Back' },
  { value: 'canister', label: 'Canister' },
  { value: 'water_pumps', label: 'Water Pumps' },
  { value: 'power_filters', label: 'Power Filters' },
  { value: 'other_filters', label: 'Other' },
];

export default function Filters() {
  const [items, setItems] = useState([]);
  const [subType, setSubType] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ category: 'filters' });
    if (subType !== 'all') params.append('subCategory', subType);

    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/accessories?${params}`);
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Failed to fetch filter items:', error);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [subType]);

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.path) return image.path;  // ✅ Cloudinary URL - use directly!
    return '/placeholder.jpg';
  };

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      <div className="toolbar">
        <select value={subType} onChange={e => setSubType(e.target.value)}>
          {FILTER_SUBS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading && <div className="center">Loading…</div>}

      <div className="grid">
        {items.map(item => (
          <div className="card" key={item._id}>
            <img src={getImageUrl(item.image)} alt={item.name} />
            <div className="card-body">
              <div className="card-title">{item.name}</div>
              {item.unit && <div className="meta">{item.unit}</div>}
              {item.brand && <div className="meta">Brand: {item.brand}</div>}
              {item.specifications?.flowRate && <div className="meta">Flow: {item.specifications.flowRate}</div>}
              {item.specifications?.powerConsumption && <div className="meta">Power: {item.specifications.powerConsumption}</div>}
              
              {item.price && <div className="price">{item.price} {item.currency || 'LKR'}</div>}
              
              {item.availability !== undefined && (
                <div className={`pill ${item.availability ? 'in' : 'out'}`}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    display: 'inline-block',
                    background: item.availability ? '#2ecc71' : '#e74c3c'
                  }} />
                  {item.availability ? 'In Stock' : 'Out of Stock'}
                </div>
              )}
              
              {item.featured && <div className="pill featured">Featured</div>}
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && <div className="center">No filters found.</div>}
    </div>
  );
}