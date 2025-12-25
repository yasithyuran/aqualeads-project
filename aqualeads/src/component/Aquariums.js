import React from 'react';
import { Link } from "react-router-dom";
import './HomePage.css'; 

const Aquariums = () => {
  const aquariumTypes = [
    {
      id: 'marine',
      title: 'Marine Tanks',
      image: '/images/marine1.jpg',
      description: 'Explore vibrant saltwater ecosystems',
      link: '/Marine'
    },
    {
      id: 'freshwater',
      title: 'Freshwater Tanks',
      image: '/images/fresh.jpg',
      description: 'Beautiful freshwater fish habitats',
      link: '/freshwater'
    }
  ];

  return (
    <div className="homepage">
      <main style={{ paddingTop: '40px' }}>
        {/* Back Arrow */}
       <div className="back-arrow" onClick={() => window.history.back()}>←</div>

        {/* Title */}
     <h1 style={{ fontWeight: 'bold', fontSize: '2rem', textAlign: 'left', marginBottom: '70px', marginTop: '30px', paddingLeft: '100px' }}>
          Aquariums
        </h1>
        {/* Aquarium Cards Grid */}
        <section className="services-section">
          <div className="container">
            <div
              className="aquarium-cards"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '30px',
                marginBottom: '60px'
              }}
            >
              {aquariumTypes.map((tank) => (
                <Link
                  key={tank.id}
                  to={tank.link}
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
                      src={tank.image}
                      alt={tank.title}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        padding: '40px 20px 20px',
                        color: 'white'
                      }}
                    >
                      <h2
                        style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          margin: 0,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {tank.title}
                      </h2>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        margin: '0 0 15px 0'
                      }}
                    >
                      {tank.description}
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

export default Aquariums;
