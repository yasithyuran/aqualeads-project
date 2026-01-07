import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Education.css';  // Using the same CSS as Education

const Conservation = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, hasPrev: false, hasNext: false });
  const navigate = useNavigate();

  useEffect(() => { 
    fetchArticles(currentPage); 
  }, [currentPage]);

  const fetchArticles = async (page = 1) => {
    setLoading(true); 
    setError(null);
    try {
      const res = await fetch(`https://aqualeads-project.onrender.com/api/articles/conservation?page=${page}&limit=6`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setArticles(data.success ? data.data : []);
      setPagination(data.success ? data.pagination : { totalPages:1, hasPrev:false, hasNext:false });
    } catch (err) {
      console.error(err);
      setError('Network error: Unable to fetch conservation articles');
    } finally { 
      setLoading(false); 
    }
  };

  const handleReadMore = id => navigate(`/conservation/${id}`);
  
  const getMainImage = (article) => {
    if (article.frontPic && article.frontPic.filename) {
      return `https://aqualeads-project.onrender.com/uploads/${article.frontPic.filename}`;
    }
    if (article.frontPic && article.frontPic.path) {
      return `https://aqualeads-project.onrender.com${article.frontPic.path}`;
    }
    return '/api/placeholder/400/300';
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
      {/* Hero Section - Using same structure as Education */}
      <div className="education-hero">
        <div className="hero-content">
          <h1>AQUA LEADS CONSERVATION</h1>
        </div>
        <div className="hero-image">
          <img 
            src="/images/Consevation 2.jpg" 
            alt="Marine Conservation" 
            onError={e => e.target.style.display = 'none'} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="education-content">
        {loading ? (
          <div className="loading-placeholder">Loading conservation articles...</div>
        ) : error ? (
          <div className="error-placeholder">{error}</div>
        ) : (
          <div className="articles-container">
            {articles.length === 0 ? (
              <div className="no-articles">No conservation articles available.</div>
            ) : (
              articles.map(article => (
                <div key={article._id} className="article-card">
                  <div className="article-content">
                    <h2>{article.title}</h2>
                    <p>{article.shortDescription}</p>
                    <button 
                      onClick={() => handleReadMore(article._id)} 
                      className="read-more-btn"
                    >
                      Read more &gt;&gt;
                    </button>
                  </div>
                  <div className="article-image">
                    <img src={getMainImage(article)} alt={article.title} />
                  </div>
                </div>
              ))
            )}

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => prev - 1)} 
                  disabled={!pagination.hasPrev}
                >
                  ‹
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
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conservation;