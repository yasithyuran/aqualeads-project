import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Education.css';

const Education = () => {
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
      const response = await fetch(`http://https://aqualead-project.onrender.com/api/articles/education?page=${page}&limit=6`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setArticles(result.data || []);
        setPagination(result.pagination || { totalPages: 1, hasPrev: false, hasNext: false });
      } else {
        setError(result.message || 'Failed to fetch articles');
        setArticles([]);
      }
    } catch (err) {
      console.error(err);
      setError('Network error: Unable to fetch articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (articleId) => {
    navigate(`/education/${articleId}`);
  };

  const getMainImage = (article) => {
    if (article.frontPic && article.frontPic.filename) {
      return `http://https://aqualead-project.onrender.com/uploads/${article.frontPic.filename}`;
    }
    if (article.frontPic && article.frontPic.path) {
      return `http://https://aqualead-project.onrender.com${article.frontPic.path}`;
    }
    return '/api/placeholder/400/300';
  };

  const generatePaginationNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = currentPage;

    if (totalPages > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
    return pages.sort((a, b) => a - b);
  };

  return (
    <div className="education-page">
      {/* Hero Section */}
      <div className="education-hero">
        <div className="hero-content">
          <h1>AQUA LEADS EDUCATION</h1>
          
        </div>
        <div className="hero-image">
          <img 
            src="/images/Education 22.jpg" 
            alt="Aquatic Education"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>


      {/* Main Content */}
      <div className="education-content">
        {loading ? (
          <div className="loading-placeholder">Loading articles...</div>
        ) : error ? (
          <div className="error-placeholder">{error}</div>
        ) : (
          <div className="articles-container">
            {articles.length === 0 ? (
              <div className="no-articles">No education articles available.</div>
            ) : (
              articles.map(article => (
                <div key={article._id} className="article-card">
                  <div className="article-content">
                    <h2>{article.title}</h2>
                    <p>{article.shortDescription}</p>
                    <button onClick={() => handleReadMore(article._id)} className="read-more-btn">
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
        )}
      </div>
    </div>
  );
};

export default Education;