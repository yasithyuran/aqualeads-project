import React, { useState, useEffect } from 'react';
import './ImportExport.css';

const ImportExport = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, hasPrev: false, hasNext: false });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPosts(currentPage, filterType);
  }, [currentPage, filterType]);

  const fetchPosts = async (page = 1, type = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '6' });
      if (type !== 'all') params.append('type', type);

      const res = await fetch(`https://aqualeads-project.onrender.com/api/imex?${params}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const result = await res.json();

      if (result.success) {
        setPosts(result.data || []);
        setPagination(result.pagination || { totalPages: 1, hasPrev: false, hasNext: false });
      } else {
        setError(result.message || 'Failed to fetch posts');
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      setError('Network error: Unable to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getMainImage = images => {
    if (!Array.isArray(images) || images.length === 0) return '/placeholder.jpg';
    const img = images[0] || {};
    return img.filename ? `https://aqualeads-project.onrender.com/uploads/${img.filename}` : '/placeholder.jpg';
  };

  const handleFilterChange = type => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const generatePaginationNumbers = () => {
    const pages = [];
    const total = pagination.totalPages;
    const current = currentPage;

    if (total > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);
    return pages.sort((a, b) => a - b);
  };

  return (
    <div className="education-page">
      <div className="back-arrow" onClick={() => window.history.back()}>←</div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {['all', 'import', 'export'].map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            style={{
              backgroundColor: filterType === type ? '#1b211c' : '#f0f0f0',
              color: filterType === type ? 'white' : '#333'
            }}
          >
            {type === 'all' ? 'All Posts' : type === 'import' ? 'Imports' : 'Exports'}
          </button>
        ))}
      </div>

      {loading && <p className="loading-message">Loading posts...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="article-card">
        {posts.length === 0 && !loading && !error && (
          <p className="no-posts-message">No posts available</p>
        )}
        
        {posts.map(post => (
          <div key={post._id} className="post-card">
            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.shortDescription}</p>
            </div>
            <div className="post-image-container">
              <img src={getMainImage(post.images)} alt={post.title} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <button 
            onClick={() => setCurrentPage(prev => prev - 1)} 
            disabled={!pagination.hasPrev}
          >
            &lt;
          </button>
          
          {generatePaginationNumbers().map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={currentPage === num ? 'active' : ''}
            >
              {num}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            disabled={!pagination.hasNext}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportExport;