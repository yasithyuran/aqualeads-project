import React from 'react';
import { Link } from "react-router-dom";
import './HomePage.css'; 

const Ariums = () => {
    
  const ariumTypes = [
    {
      id: 'scenariums',
      title: 'Scenariums',
      image: '/images/beautiful_aquascape.jpg',
      description: 'Artistic aquascaping with dramatic landscapes',
      link: '/scenarium'
    },
    {
      id: 'aquariums',
      title: 'Aquariums',
      image: '/images/aquarium1.jpg',
      description: 'Traditional fish tanks with aquatic life',
      link: '/Aquariums'
    },
    {
      id: 'paludariums',
      title: 'Paludariums',
      image: '/images/paludarium1.jpg',
      description: 'Half land, half water ecosystems',
      link: '/paludarium'
    },
    {
      id: 'terrariums',
      title: 'Terrariums',
      image: '/images/terrarium1.jpg',
      description: 'Enclosed glass gardens with plants',
      link: '/terrarium'
    },
    {
      id: 'vivariums',
      title: 'Vivariums',
      image: '/images/vivarium1.jpg',
      description: 'Living habitats for small animals',
      link: '/vivarium'
    },
    {
      id: 'ponds',
      title: 'Ponds',
      image: '/images/ponds1.jpg',
      description: 'Outdoor/Indoor water features and pond systems',
      link: '/Pond'
    },
    {
      id: 'landscaping',
      title: 'Landscaping',
      image: '/images/Landscape1.jpeg',
      description: 'Professional outdoor and indoor landscape design',
      link: '/landscape'
    }
  ];

  return (
    <div className="homepage">
      <main style={{ paddingTop: '40px' }}>
         
        
        {/* Ariums Grid */}
        <section className="services-section" style={{ paddingTop: '20px' }}>
          <div className="container">
            <div className="ariums-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
              marginBottom: '60px'
            }}>
              {ariumTypes.map((arium) => (
                <Link
                  key={arium.id}
                  to={arium.link}
                  className="arium-card"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={arium.image}
                      alt={arium.title}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      padding: '40px 20px 20px',
                      color: 'white'
                    }}>
                      <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: '0',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        {arium.title}
                      </h2>
                    </div>
                  </div>
                  <div style={{
                    padding: '20px'
                  }}>
                    <p style={{
                      color: '#666',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      margin: '0 0 15px 0'
                    }}>
                      {arium.description}
                    </p>
                    
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
       <footer className="footer">
              <div className="container">
                <div className="footer-content">
                  <div className="footer-logo">
                    <img 
                      src="/images/aqua leads logo.png" 
                      alt="Aqua Leads Logo" 
                      className="footer-logo-image"
                    />
                  </div>
                  <div className="footer-info">
                    <div className="footer-column">
                      <h4>Services</h4>
                      <ul>
                        <li><Link to="/education">Education</Link></li>
                        <li><Link to="/conservation">Conservation</Link></li>
                        <li><Link to="/interior">Interior</Link></li>
                      </ul>
                    </div>
                    <div className="footer-column">
                      <h4>Social Media</h4>
                      <ul>
                        <li><a href="https://www.facebook.com/share/1G18eabtbQ/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://www.instagram.com/aqualeads_/?utm_source=qr&igsh=a2w0ZzE1bHBzOGNk" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                        <li><a href="https://wa.me/94762620828" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
                        <li><a href="https://whatsapp.com/channel/0029VbBTMxRGufJ3Tkx1mh0e" target="_blank" rel="noopener noreferrer">WhatsApp Channel</a></li>
                        <li><a href="https://www.youtube.com/@Aqualeads" target="_blank" rel="noopener noreferrer">Youtube</a></li>
                        <li><a href="https://www.tiktok.com/@aqua_leads?_r=1&_t=ZS-91RHnRwcPii" target="_blank" rel="noopener noreferrer">Tiktok</a></li>
                      </ul>
                    </div>
                    <div className="footer-column">
                      <h4>Contact us</h4>
                      <ul>
                        <li><a href="mailto:aqualeads1@Email.com">aqualeads1@gmail.com</a></li>
                        <li><a href="tel:+94762620828">+94 76 262 0828</a></li>
                        <li>12, Woodland Avenue,<br/>Kohuwala, Nugegoda.</li>
                        <li><a href="https://maps.app.goo.gl/jTAo4tTUHudDjMt47?g_st=ipc" target="_blank" rel="noopener noreferrer">Googel Map</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="footer-bottom">
                  <p>&copy; 2024 Aqua Leads. All rights reserved.</p>
                </div>
              </div>
            </footer>
    </div>
  );
};

export default Ariums;