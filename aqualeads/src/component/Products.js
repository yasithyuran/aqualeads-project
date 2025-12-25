import React, { useState, useEffect } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    availability: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'animal_food', label: 'Animal Food' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'terrarium', label: 'Terrarium Products' },
    { value: 'other', label: 'Other Products' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Availability' },
    { value: 'IN STOCK', label: 'In Stock' },
    { value: 'OUT OF STOCK', label: 'Out of Stock' },
    { value: 'LIMITED', label: 'Limited Stock' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        category: filters.category,
        availability: filters.availability
      });
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data || []);
        setPagination(result.pagination || {});
        
        const imgIndexes = {};
        (result.data || []).forEach(product => {
          imgIndexes[product._id] = 0;
        });
        setCurrentImageIndexes(imgIndexes);
      } else {
        setError(result.message || 'Failed to fetch products');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Network error: Unable to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=200&fit=crop';
    if (image.filename) return `http://localhost:5000/uploads/${image.filename}`;
    if (image.path) return `http://localhost:5000${image.path}`;
    return 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=200&fit=crop';
  };

  const nextImage = (productId, e) => {
    e.stopPropagation();
    const product = products.find(p => p._id === productId);
    if (product?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [productId]: prev[productId] === product.images.length - 1 ? 0 : prev[productId] + 1
      }));
    }
  };

  const prevImage = (productId, e) => {
    e.stopPropagation();
    const product = products.find(p => p._id === productId);
    if (product?.images?.length > 1) {
      setCurrentImageIndexes(prev => ({
        ...prev,
        [productId]: prev[productId] === 0 ? product.images.length - 1 : prev[productId] - 1
      }));
    }
  };

  const expandImage = (product) => {
    setExpandedImage({
      ...product,
      currentIndex: currentImageIndexes[product._id] || 0
    });
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  const navigateExpandedImage = (direction) => {
    if (!expandedImage || !expandedImage.images || expandedImage.images.length <= 1) return;

    setExpandedImage(prev => ({
      ...prev,
      currentIndex: direction === 'next' 
        ? (prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1)
        : (prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1)
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const getAvailabilityStyle = (availability) => {
    switch (availability) {
      case 'IN STOCK': 
        return { backgroundColor: '#4CAF50', color: 'white' };
      case 'OUT OF STOCK': 
        return { backgroundColor: '#F44336', color: 'white' };
      case 'LIMITED': 
        return { backgroundColor: '#FF9800', color: 'white' };
      default: 
        return { backgroundColor: '#9E9E9E', color: 'white' };
    }
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '40px',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            background: pagination.hasPrev ? '#fff' : '#f5f5f5',
            cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={!pagination.hasPrev}
        >
          ‹
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              background: page === current ? '#333' : page === '...' ? 'transparent' : '#fff',
              color: page === current ? '#fff' : '#333',
              cursor: typeof page === 'number' ? 'pointer' : 'default',
              borderRadius: '6px',
              minWidth: '40px',
              fontSize: '14px'
            }}
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}
        
        <button
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            background: pagination.hasNext ? '#fff' : '#f5f5f5',
            cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
          disabled={!pagination.hasNext}
        >
          ›
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #333',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ marginBottom: '15px' }}>Error Loading Products</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '10px 24px',
              border: 'none',
              background: '#333',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', marginTop: '20px' }}>
        <h1 style={{ 
          fontWeight: 'bold', 
          fontSize: '2.5rem', 
          textAlign: 'center',
          marginBottom: '10px',
          color: '#333'
        }}>
          Aqua Leads Products
        </h1>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          Discover our premium aquarium products
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '20px',
        marginBottom: '40px',
        marginLeft: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Category Filter */}
        <select 
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Availability Filter */}
        <select 
          value={filters.availability}
          onChange={(e) => handleFilterChange('availability', e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          {availabilityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '24px' }}>No products found</h3>
          <p style={{ color: '#666', fontSize: '16px' }}>Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '20px'
          }}>
            {products.map((product) => (
              <div 
                key={product._id} 
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image */}
                <div 
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    background: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                  onClick={() => expandImage(product)}
                >
                  <img 
                    src={getImageUrl(product.images?.[currentImageIndexes[product._id]] || product.images?.[0])}
                    alt={product.name}
                    style={{
                      maxWidth: '85%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  
                  {/* Image Navigation */}
                  {product.images?.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => prevImage(product._id, e)}
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        ‹
                      </button>
                      <button 
                        onClick={(e) => nextImage(product._id, e)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        ›
                      </button>
                      
                      {/* Image Dots */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '6px'
                      }}>
                        {product.images.map((_, index) => (
                          <button 
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndexes(prev => ({
                                ...prev,
                                [product._id]: index
                              }));
                            }}
                            style={{
                              width: '8px',
                              height: '8px',
                              background: index === currentImageIndexes[product._id] ? '#333' : '#ccc',
                              borderRadius: '50%',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: '#333'
                  }}>
                    {product.name}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '15px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.shortDescription}
                  </p>

                  {/* Price Display - Only show if exists */}
                  {product.price !== undefined && product.price !== null && (
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#2c5f2d',
                      marginBottom: '12px'
                    }}>
                      {product.price.toFixed(2)} {product.currency || 'LKR'}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '15px',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#999',
                      textTransform: 'capitalize',
                      fontWeight: '500'
                    }}>
                      {categories.find(cat => cat.value === product.category)?.label || product.category}
                    </span>
                    
                    {/* Availability Badge - Only show if exists */}
                    {product.availability && (
                      <span style={{
                        ...getAvailabilityStyle(product.availability),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {product.availability}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeExpandedImage}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={closeExpandedImage}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '24px',
                zIndex: 1001,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              ×
            </button>
            
            <img 
              src={getImageUrl(expandedImage.images?.[expandedImage.currentIndex])}
              alt={expandedImage.name}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {expandedImage.images?.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateExpandedImage('prev');
                  }}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                    fontSize: '28px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  ‹
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateExpandedImage('next');
                  }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                    fontSize: '28px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  ›
                </button>
                
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '16px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }}
                >
                  {expandedImage.currentIndex + 1} / {expandedImage.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Products;