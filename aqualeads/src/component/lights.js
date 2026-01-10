import React, { useEffect, useState } from 'react';
import './LiveGrid.css';

export default function Lights() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ category: 'lights' });

    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/accessories?${params}`);
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Failed to fetch lights:', error);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.path) return image.path;  // ✅ Cloudinary URL - use directly!
    return '/placeholder.jpg';
  };

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      <div className="toolbar">
        <h2>Aquarium Lights</h2>
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

      {!loading && items.length === 0 && <div className="center">No lights found.</div>}
    </div>
  );
}