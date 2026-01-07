import React, { useState, useEffect } from 'react';
import './Interior.css';

const Interior = () => {
  const [interiors, setInteriors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, hasPrev: false, hasNext: false });
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState(0);

  const itemsPerPage = 3;

  useEffect(() => {
    fetchInteriors(currentPage);
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentPage]);

  const fetchInteriors = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: itemsPerPage.toString() });
      const res = await fetch(`https://aqualeads-project.onrender.com/api/interiors?${params}`);
      const result = await res.json();

      if (result.success) {
        setInteriors(result.data || []);
        setPagination(result.pagination || { totalPages: 1, hasPrev: false, hasNext: false });
        const imgIndexes = {};
        (result.data || []).forEach(i => { imgIndexes[i._id] = 0; });
        setCurrentImageIndexes(imgIndexes);
      } else {
        setError(result.message || 'Failed to fetch interior projects');
        setInteriors([]);
      }
    } catch (err) {
      console.error(err);
      setError('Network error: Unable to fetch interior projects');
      setInteriors([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePaginationNumbers = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/600/400';
    if (image.filename) return `https://aqualeads-project.onrender.com/uploads/${image.filename}`;
    if (image.path) return `https://aqualeads-project.onrender.com${image.path}`;
    return '/api/placeholder/600/400';
  };

  const nextImage = (interiorId) => {
    const interior = interiors.find(i => i._id === interiorId);
    if (interior?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [interiorId]: prev[interiorId] === interior.images.length - 1 ? 0 : prev[interiorId] + 1
      }));
    }
  };

  const prevImage = (interiorId) => {
    const interior = interiors.find(i => i._id === interiorId);
    if (interior?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [interiorId]: prev[interiorId] === 0 ? interior.images.length - 1 : prev[interiorId] - 1
      }));
    }
  };

  const expandImage = (interior) => {
    setExpandedImage(interior);
    setExpandedImageIndex(currentImageIndexes[interior._id] || 0);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  if (loading) return <div className="loading-placeholder">Loading...</div>;
  if (error) return <div className="error-placeholder">{error}</div>;
  if (!interiors.length) return <div className="error-placeholder">No interior projects available</div>;

  return (
    <div className="interior-page">
      {/* Cards */}
      <div className="interior-content">
        {interiors.map(interior => (
          <div key={interior._id} className="interior-card">
            <div className="card-image-section">
              {interior.images?.length > 0 && (
                <div className="image-container">
                  <img
                    className="main-image"
                    src={getImageUrl(interior.images[currentImageIndexes[interior._id] || 0])}
                    alt={interior.title}
                    onClick={() => expandImage(interior)}
                    style={{ cursor: 'pointer' }}
                  />
                  {interior.images.length > 1 && (
                    <>
                      <button className="nav-arrow left" onClick={() => prevImage(interior._id)}>❮</button>
                      <button className="nav-arrow right" onClick={() => nextImage(interior._id)}>❯</button>
                      <div className="image-indicators">
                        {interior.images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`indicator ${currentImageIndexes[interior._id] === idx ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [interior._id]: idx }))}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="card-content">
              <h2 className="project-title">{interior.title}</h2>
              <div className="project-details">
                <p><strong>Date:</strong> {formatDate(interior.createdAt)}</p>
                <p>{interior.shortDescription}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={!pagination.hasPrev}>‹</button>
            {generatePaginationNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? 'active' : ''}
              >
                {pageNum}
              </button>
            ))}
            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={!pagination.hasNext}>›</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {expandedImage && (
        <div className="image-modal" onClick={closeExpandedImage}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeExpandedImage}>×</button>
            <div className="modal-image-container">
              <img
                className="modal-image"
                src={getImageUrl(expandedImage.images[expandedImageIndex])}
                alt={`Expanded ${expandedImage.title}`}
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
              <p>{expandedImage.shortDescription}</p>
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
};

export default Interior;