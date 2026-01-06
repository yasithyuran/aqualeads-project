import React, { useEffect, useState } from 'react';
import './LiveGrid.css';

const HARDSCAPE_SUBS = [
  { value: 'all', label: 'All Hardscape' },
  { value: 'full_hardscapes', label: 'Full Hardscapes' },
  { value: 'driftwoods', label: 'Driftwoods' },
  { value: 'stones', label: 'Stones' },
  { value: 'sand', label: 'Sand' },
  { value: 'gravel', label: 'Gravel' },
];

export default function Hardscape() {
  const [items, setItems] = useState([]);
  const [subType, setSubType] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ category: 'hardscape' });
    if (subType !== 'all') params.append('subCategory', subType);

    try {
      const res = await fetch(`http://https://aqualead-project.onrender.com/api/accessories?${params}`);
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Failed to fetch hardscape items:', error);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [subType]);

  const getImageUrl = (image) => {
    return image?.path ? `http://https://aqualead-project.onrender.com${image.path}` : '/placeholder.jpg';
  };

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      <div className="toolbar">
        <select value={subType} onChange={e => setSubType(e.target.value)}>
          {HARDSCAPE_SUBS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="center">Loading…</div>}

      <div className="grid">
        {items.map(item => (
          <div className="card" key={item._id}>
            <img src={getImageUrl(item.image)} alt={item.name} />
            <div className="card-body">
              <div className="card-title">{item.name}</div>
              {item.stock !== undefined && item.stock > 0 && <div className="meta">Stock: {item.stock}</div>}
              
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
              {item.price && <div className="price">{item.price} {item.currency || 'LKR'}</div>}
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && <div className="center">No items found.</div>}
    </div>
  );
}