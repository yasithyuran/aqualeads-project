import React, { useEffect, useState } from 'react';
import './LiveGrid.css';

const SUBS = [
  { value: 'all', label: 'All Stock' },
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

export default function Fish() {
  const [items, setItems] = useState([]);
  const [subType, setSubType] = useState('all');
  const [page, setPage] = useState(1);
  const [pg, setPg] = useState({ totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, sub = 'all') => {
    setLoading(true);
    const params = new URLSearchParams({ itemType: 'fish', page: p.toString(), limit: '12' });
    if (sub !== 'all') params.append('subType', sub);
    const res = await fetch(`https://aqualeads-project.onrender.com/api/livestock?${params}`);
    const json = await res.json();
    if (json.success) {
      setItems(json.data);
      setPg(json.pagination);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(page, subType); }, [page, subType]);

  const imgSrc = (image) => image?.path ? `https://aqualeads-project.onrender.com${image.path}` : '/placeholder.jpg';

  // Helper to check if item has pricing info
  const hasPrice = (item) => item.price !== undefined && item.price !== null;
  
  // Helper to check if item has availability info
  const hasAvailability = (item) => item.availability !== undefined && item.availability !== null;

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      <div className="toolbar">
        <select className="select" value={subType} onChange={e => { setSubType(e.target.value); setPage(1); }}>
          {SUBS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading && <div className="center">Loading...</div>}

      <div className="grid">
        {items.map(item => (
          <div className="card" key={item._id}>
            <img src={imgSrc(item.image)} alt={item.name} />
            <div className="card-body">
              <div className="card-title">{item.name.toUpperCase()}</div>
              
              {/* Only show unit if pricing exists */}
              {hasPrice(item) && item.unit && (
                <div className="meta">{item.unit.toUpperCase()}</div>
              )}
              
              {/* Only show price if it exists */}
              {hasPrice(item) && (
                <div className="price">{item.price} {item.currency || 'LKR'}</div>
              )}
              
              {/* Only show availability if it exists */}
              {hasAvailability(item) && (
                <div className={`pill ${item.availability ? 'in' : 'out'}`}>
                  <span style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: 999, 
                    background: item.availability ? '#2ecc71' : '#e74c3c', 
                    display: 'inline-block',
                    marginRight: 6
                  }} />
                  {item.availability ? 'In Stock' : 'Out of Stock'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pg.totalPages > 1 && (
        <div className="pagination">
          <button disabled={!pg.hasPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
          {Array.from({ length: pg.totalPages }, (_, i) => i + 1).slice(0, 9).map(n => (
            <button key={n} className={n === pg.currentPage ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button disabled={!pg.hasNext} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {!loading && items.length === 0 && <div className="center">No items found.</div>}
    </div>
  );
}