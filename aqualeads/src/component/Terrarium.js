import React, { useState, useEffect } from 'react';
import './AriumInside.css';

export default function Terrarium() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);

  useEffect(() => {
    fetchItems();
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://aqualeads-project.onrender.com/api/ariums?mainCategory=terrarium');
      const json = await res.json();
      const data = Array.isArray(json) ? json : [];
      setItems(data);
      const imgIndexes = {};
      data.forEach(i => { imgIndexes[i._id] = 0; });
      setCurrentImageIndexes(imgIndexes);
    } catch (err) {
      console.error('Error fetching terrariums:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

 const getImageUrl = (image) => {
  if (!image) return '/placeholder.jpg';
  if (image.path) return image.path;
  return '/placeholder.jpg';
};

  const nextImage = (itemId) => {
    const item = items.find(i => i._id === itemId);
    if (item?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [itemId]: prev[itemId] === item.images.length - 1 ? 0 : prev[itemId] + 1
      }));
    }
  };

  const prevImage = (itemId) => {
    const item = items.find(i => i._id === itemId);
    if (item?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [itemId]: prev[itemId] === 0 ? item.images.length - 1 : prev[itemId] - 1
      }));
    }
  };

  const expandImage = (item) => {
    setExpandedImage(item);
    setExpandedImageIndex(currentImageIndexes[item._id] || 0);
    document.body.style.overflow = 'hidden';
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateExpandedImage = (direction) => {
    if (!expandedImage?.images) return;
    const totalImages = expandedImage.images.length;
    if (direction === 'next') {
      setExpandedImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setExpandedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  if (loading) return <div className="center">Loading Terrariums...</div>;

  return (
    <div className="live-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>
      <div className="toolbar"> <h2 style={{ fontWeight: 'bold', fontSize: '2rem', textAlign: 'left', marginBottom: '70px', marginTop: '30px', paddingLeft: '100px' }}>Terrariums</h2></div>

      <div className="grid">
        {items.map(item => (
          <div className="card" key={item._id}>
            {item.images?.length > 0 && (
              <div className="image-container">
                <img
                  className="card-image"
                  src={getImageUrl(item.images[currentImageIndexes[item._id] || 0])}
                  alt={item.title}
                  onClick={() => expandImage(item)}
                />
                {item.images.length > 1 && (
                  <>
                    <button className="nav-arrow left" onClick={() => prevImage(item._id)}>❮</button>
                    <button className="nav-arrow right" onClick={() => nextImage(item._id)}>❯</button>
                    <div className="image-indicators">
                      {item.images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator ${currentImageIndexes[item._id] === idx ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [item._id]: idx }))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="card-body">
              <div className="card-title">{item.title}</div>
              {item.description && <div className="meta">{item.description}</div>}
              <div className="pill">{item.type === 'project' ? 'Project' : 'Gallery'}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && <div className="center">No terrariums available yet.</div>}

      {expandedImage && (
        <div className="image-modal" onClick={closeExpandedImage}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeExpandedImage}>×</button>
            <div className="modal-image-container">
              <img
                className="modal-image"
                src={getImageUrl(expandedImage.images[expandedImageIndex])}
                alt={expandedImage.title}
              />
              {expandedImage.images.length > 1 && (
                <>
                  <button className="modal-nav-arrow modal-left" onClick={() => navigateExpandedImage('prev')}>❮</button>
                  <button className="modal-nav-arrow modal-right" onClick={() => navigateExpandedImage('next')}>❯</button>
                </>
              )}
            </div>
            <div className="modal-info">
              <h3>{expandedImage.title}</h3>
              <p>{expandedImage.description}</p>
              <p className="image-counter">{expandedImageIndex + 1} / {expandedImage.images.length}</p>
            </div>
            <div className="modal-indicators">
              {expandedImage.images.map((_, idx) => (
                <button
                  key={idx}
                  className={`modal-indicator ${expandedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setExpandedImageIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}