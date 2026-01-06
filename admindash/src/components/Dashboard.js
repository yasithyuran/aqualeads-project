import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!token || !adminData) {
      navigate('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('http://https://aqualead-project.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/login');
    }
  };

  const dashboardCards = [
    // ----- ADD CARDS -----
    {
      id: 'articles',
      title: 'Add Articles',
      description: 'Add educational content and resources',
      icon: '📚',
      color: '#3b82f6',
      category: 'add',
      action: () => navigate('/addarticles')
    },
    {
      id: 'addAriums',
      title: 'Add Ariums',
      description: 'Add conservation projects and initiatives',
      icon: '🌱',
      color: '#10b981',
      category: 'add',
      action: () => navigate('/addariums')
    },
    {
      id: 'interior',
      title: 'Add Interior',
      description: 'Add aquarium interior designs',
      icon: '🏠',
      color: '#f59e0b',
      category: 'add',
      action: () => navigate('/addinterior')
    },
    {
      id: 'im-export',
      title: 'Add Import/Export',
      description: 'Add import/export marine data',
      icon: '🐠',
      color: '#06b6d4',
      category: 'add',
      action: () => navigate('/addimex')
    },
    {
      id: 'products',
      title: 'Add Products',
      description: 'Add product details and info',
      icon: '💧',
      color: '#ef4444',
      category: 'add',
      action: () => navigate('/addproducts')
    },
    {
      id: 'accessories',
      title: 'Add Accessories',
      description: 'Add aquarium equipment and tools',
      icon: '⚙️',
      color: '#8b5cf6',
      category: 'add',
      action: () => navigate('/addaccess')
    },
    {
      id: 'livestock',
      title: 'Add Live Stock',
      description: 'Add new live stock data',
      icon: '🐟',
      color: '#0ea5e9',
      category: 'add',
      action: () => navigate('/addliveitem')
    },

    // ----- MANAGE CARDS -----
    {
      id: 'manage-articles',
      title: 'Manage Articles',
      description: 'View, edit, or delete articles',
      icon: '🧾',
      color: '#2563eb',
      category: 'manage',
      action: () => navigate('/managearticles')
    },
    {
      id: 'manage-ariums',
      title: 'Manage Ariums',
      description: 'View, edit, or delete arium records',
      icon: '🌿',
      color: '#059669',
      category: 'manage',
      action: () => navigate('/manageariums')
    },
    {
      id: 'manage-interior',
      title: 'Manage Interior',
      description: 'View, edit, or delete interiors',
      icon: '🛋️',
      color: '#d97706',
      category: 'manage',
      action: () => navigate('/manageinterior')
    },
    {
      id: 'manage-importexport',
      title: 'Manage Import/Export',
      description: 'View, edit, or delete import/export data',
      icon: '🚢',
      color: '#0891b2',
      category: 'manage',
      action: () => navigate('/manageimex')
    },
    {
      id: 'manage-products',
      title: 'Manage Products',
      description: 'View, edit, or delete products',
      icon: '🛒',
      color: '#dc2626',
      category: 'manage',
      action: () => navigate('/manageproducts')
    },
    {
      id: 'manage-accessories',
      title: 'Manage Accessories',
      description: 'View, edit, or delete accessories',
      icon: '🔧',
      color: '#7c3aed',
      category: 'manage',
      action: () => navigate('/manageaccessories') // FIXED: Changed from /ManageAccess
    },
    {
      id: 'manage-livestock',
      title: 'Manage Live Stock',
      description: 'View, edit, or delete live stock',
      icon: '🐡',
      color: '#0284c7',
      category: 'manage',
      action: () => navigate('/managelivestock')
    }
  ];

  const filteredCards = activeSection === 'all' 
    ? dashboardCards 
    : dashboardCards.filter(card => card.category === activeSection);

  if (!admin) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🐠 AquaLeads Admin</h1>
          <p className="welcome-text">Welcome back, <strong>{admin.username}</strong>!</p>
        </div>
        <div className="header-right">
          <div className="current-time">
            📅 {currentTime.toLocaleString()}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeSection === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSection('all')}
          >
            All Sections
          </button>
          <button 
            className={`filter-tab ${activeSection === 'add' ? 'active' : ''}`}
            onClick={() => setActiveSection('add')}
          >
            ➕ Add Content
          </button>
          <button 
            className={`filter-tab ${activeSection === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveSection('manage')}
          >
            📊 Manage Content
          </button>
        </div>

        <div className="cards-grid">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="dashboard-card"
              style={{ borderLeftColor: card.color }}
              onClick={card.action}
            >
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="card-arrow" style={{ color: card.color }}>
                →
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="empty-state">
            <p>No items found in this section.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;