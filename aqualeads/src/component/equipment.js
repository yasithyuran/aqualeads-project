import React, { useEffect, useState } from 'react';
import './LiveGrid.css';

const EQUIPMENT_SUBS = [
  { value: 'all', label: 'All Equipments' },
  { value: 'heaters', label: 'Heaters' },
  { value: 'air_pumps', label: 'Air Pumps' },
  { value: 'co2_systems', label: 'CO2 Systems' },
  { value: 'test_kits', label: 'Test Kits' },
  { value: 'cleaning_tools', label: 'Cleaning Tools' },
  { value: 'other_equipment', label: 'Other' },
];

export default function Equipments() {
  const [items, setItems] = useState([]);
  const [subType, setSubType] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ category: 'equipments' });
    if (subType !== 'all') params.append('subCategory', subType);

    try {
      const res = await fetch(`http://localhost:5000/api/accessories?${params}`);
      const json = await res.json();

      if (Array.isArray(json)) setItems(json);
      else setItems([]);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      setItems([]);
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [subType]);

  const imgSrc = (image) =>
    image?.path ? `http://localhost:5000${image.path}` : '/placeholder.jpg';

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      <div className="toolbar">
        <select
          className="select"
          value={subType}
          onChange={e => setSubType(e.target.value)}
        >
          {EQUIPMENT_SUBS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="center">Loading…</div>}

      <div className="grid">
        {items.map(item => (
          <div className="card" key={item._id}>
            <img src={imgSrc(item.image)} alt={item.name} />
            <div className="card-body">
              <div className="card-title">{item.name}</div>
              {item.unit && <div className="meta">{item.unit}</div>}
              {item.brand && <div className="meta">Brand: {item.brand}</div>}
              {item.specifications?.powerConsumption && (
                <div className="meta">Power: {item.specifications.powerConsumption}</div>
              )}
              
              {item.price && <div className="price">{item.price} {item.currency || 'LKR'}</div>}
              
              {item.availability !== undefined && (
                <div className={`pill ${item.availability ? 'in' : 'out'}`}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 999,
                    display: 'inline-block',
                    background: item.availability ? '#2ecc71' : '#e74c3c'
                  }} />
                  {item.availability ? 'In Stock' : 'Out of Stock'}
                </div>
              )}
              
              {item.featured && (
                <div className="pill featured">
                  <span style={{
                    width: 8, height: 8, borderRadius: 999,
                    display: 'inline-block', background: '#f39c12'
                  }} />
                  Featured
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="center">No equipments found.</div>
      )}
    </div>
  );
}