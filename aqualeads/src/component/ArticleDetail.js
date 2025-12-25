import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Determine category from URL path
  const category = location.pathname.includes('/education/') 
    ? 'education' 
    : location.pathname.includes('/conservation/') 
      ? 'conservation' 
      : null;

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/articles/single/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success) {
        if (category && result.data.category !== category) {
          setError(`This article is not found in the ${category} category`);
        } else {
          setArticle(result.data);
        }
      } else {
        setError(result.message || 'Failed to fetch article');
      }
    } catch (err) {
      console.error(err);
      setError('Network error: Unable to fetch article');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/api/placeholder/400/300';
    if (image.filename) return `http://localhost:5000/uploads/${image.filename}`;
    if (image.path) return `http://localhost:5000${image.path}`;
    return '/api/placeholder/400/300';
  };

  const handleBack = () => {
    if (category) {
      navigate(`/${category}`);
    } else {
      navigate(-1);
    }
  };

  const getCategoryDisplayName = (cat) => {
    switch (cat) {
      case 'education': return 'Education';
      case 'conservation': return 'Conservation';
      default: return 'Article';
    }
  };

  const nextSlide = () => {
    if (article && article.images && article.images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % article.images.length);
    }
  };

  const prevSlide = () => {
    if (article && article.images && article.images.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + article.images.length) % article.images.length);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) return (
    <div className="article-detail-page">
      <div className="loading-placeholder">Loading article...</div>
    </div>
  );

  if (error || !article) return (
    <div className="article-detail-page">
      <div className="back-arrow" onClick={handleBack}>←</div>
      <div className="error-container">
        <h2>Article Not Found</h2>
        <p>{error || 'The article you are looking for does not exist.'}</p>
        <button onClick={handleBack} className="back-btn">Go Back</button>
      </div>
    </div>
  );

  return ( 
    <div className="article-detail-page">
      <div className="back-arrow" onClick={handleBack}>←</div>

      <div className="article-container">
        <h1 className="article-title">{article.title}</h1>

        {/* Front Picture Display */}
        {article.frontPic && (
          <div className="article-image-section">
            <img
              src={getImageUrl(article.frontPic)}
              alt={article.title}
              className="main-article-image"
              onError={(e) => e.target.src = '/api/placeholder/600/400'}
            />
            {article.frontPic.caption && <p className="image-caption">{article.frontPic.caption}</p>}
          </div>
        )}

        <div className="article-content">
          {article.shortDescription && <p className="article-summary">{article.shortDescription}</p>}

          <div className="article-main-text">
            {article.mainDescription ? (
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ __html: article.mainDescription.replace(/\n/g, '<br />') }}
              />
            ) : article.content ? (
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
              />
            ) : <p>No content available.</p>}
          </div>

          {/* Slideshow for Additional Images */}
          {article.images && article.images.length > 0 && (
            <div className="slideshow-container">
              <div className="slideshow-wrapper">
                <button className="slideshow-btn prev-btn" onClick={prevSlide}>❮</button>
                
                <div className="slide-content">
                  <img
                    src={getImageUrl(article.images[currentSlide])}
                    alt={article.images[currentSlide].caption || `Slide ${currentSlide + 1}`}
                    className="slideshow-image"
                    onError={(e) => e.target.src = '/api/placeholder/800/500'}
                  />
                  {article.images[currentSlide].caption && (
                    <p className="slideshow-caption">{article.images[currentSlide].caption}</p>
                  )}
                </div>

                <button className="slideshow-btn next-btn" onClick={nextSlide}>❯</button>
              </div>

              <div className="slideshow-dots">
                {article.images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>

              <div className="slide-counter">
                {currentSlide + 1} / {article.images.length}
              </div>
            </div>
          )}

          {/* Related Links */}
          {article.urls && article.urls.length > 0 && (
            <div className="related-links">
              <h3>Related Links</h3>
              <ul>
                {article.urls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url.link} target="_blank" rel="noopener noreferrer">
                      {url.title || url.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Meta Information */}
          <div className="article-meta">
            <span className="category-badge">{getCategoryDisplayName(article.category)}</span>
            {article.author && <span className="author">By: {article.author}</span>}
            {article.createdAt && (
              <span className="date">
                {new Date(article.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;