import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img 
              src="/images/aqua leads logo.png" 
              alt="Aqua Leads Logo" 
              className="logo-image"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/Ariums" className="nav-link">Ariums</Link></li>
            <li><Link to="/education" className="nav-link">Education</Link></li>
            <li><Link to="/conservation" className="nav-link">Conservation</Link></li>
            <li><Link to="/interior" className="nav-link">Interior</Link></li>
          </ul>
        </nav>

        {/* Mobile menu toggle */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;