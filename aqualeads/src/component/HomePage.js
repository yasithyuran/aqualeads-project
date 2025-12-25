import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './HomePage.css';

const HomePage = () => {
  const [displaySlide1, setDisplaySlide1] = useState(0);
  const [displaySlide2, setDisplaySlide2] = useState(0);
  const [natureSlide, setNatureSlide] = useState(0);

  const services = [
    { image: '/images/education.png', title: 'Education', description: 'Learn aquascaping techniques', link: '/education' },
    { image: '/images/concervation.png', title: 'Conservation', description: 'Environmental protection', link: '/conservation' },
    { image: '/images/ariums.png', title: 'Ariums', description: 'Custom aquarium design', link: "/Ariums" },
    { image: '/images/interior desgns.png', title: 'Interior', description: 'Get in touch with us', link: '/interior' },
    { image: '/images/live stock.png', title: 'Live Stock', description: 'Quality aquatic life', link: '/livestock' },
    { image: '/images/accessories.png', title: 'Accessories', description: 'Professional aquascaping', link: '/access' },
    { image: '/images/products.png', title: 'Products', description: 'Aquarium supplies', link: '/Products' },
    { image: '/images/import export.png', title: 'Import/Export', description: 'Global trade services', link: "/ImportExport" }
  ];

  const displayImages = [
    { src: "/images/Paludarium.jpg", link: "/Paludarium", title: "Aquarium 1" },
    { src: "/images/Scenarium.jpg", link: "/Scenarium", title: "Aquarium 2" },
    { src: "/images/Terrarium.jpg", link: "/Terrarium", title: "Aquarium 3" },
    { src: "/images/Vivarium.jpg", link: "/Vivarium", title: "Aquarium 4" }
  ];

  const natureImages = [
    { src: "/images/Education.jpg", link: "/Education", title: "Nature Scene 1" },
    { src: "/images/Consevation.jpg", link: "/Conservation", title: "Aquatic Life" },
    { src: "/images/Accessories.jpg", link: "/access", title: "Underwater World" },
    { src: "/images/Livestock.jpg", link: "/livestock", title: "Marine Environment" }
  ];

  const displayImages2 = [
    { src: "/images/Lowtech.jpg", link: "/Lowt", title: "Display 1" },
    { src: "/images/Hightech.jpg", link: "/Hight", title: "Display 2" },
    { src: "/images/Biotope.jpg", link: "/Biotope", title: "Display 3" },
    { src: "/images/Marine.jpg", link: "/Marine", title: "Display 4" }
  ];

  useEffect(() => {
    const display1Interval = setInterval(() => {
      setDisplaySlide1((prev) => (prev + 1) % displayImages.length);
    }, 4000);

    const display2Interval = setInterval(() => {
      setDisplaySlide2((prev) => (prev + 1) % displayImages2.length);
    }, 4500);

    const natureInterval = setInterval(() => {
      setNatureSlide((prev) => (prev + 1) % natureImages.length);
    }, 5000);

    return () => {
      clearInterval(display1Interval);
      clearInterval(display2Interval);
      clearInterval(natureInterval);
    };
  }, []);

  const Slideshow = ({ images, currentSlide, setSlide, className = "" }) => (
    <div className={`slideshow-container ${className}`}>
      <div className="slideshow-wrapper">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="slide-container" 
            style={{ 
              transform: `translateX(${(index - currentSlide) * 100}%)`,
              transition: 'transform 1s ease-in-out'
            }}
          >
            <img src={image.src} alt={image.title} className="slide" />
            <div className="slide-overlay">
              <Link to={image.link} className="explore-button">
                Explore More
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="slideshow-nav prev"
        onClick={() => setSlide((prev) => (prev - 1 + images.length) % images.length)}
      >❮</button>
      <button 
        className="slideshow-nav next"
        onClick={() => setSlide((prev) => (prev + 1) % images.length)}
      >❯</button>
      <div className="slideshow-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`slideshow-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setSlide(index)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img 
            src="/images/artwork-001.jpg" 
            alt="Beautiful Aquascape" 
            className="aquarium-image"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">What is AQUA LEADS?</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Aqua Leads Ltd has always been fascinated by the tranquility and color 
                of under-water worlds. Starting Aqua Leads in 2016 was my way of turning that 
                passion into a lifelong mission—helping others discover the joy of aquariums 
                too. Whether you're a first-time aquarium owner, an experienced aquarium 
                owner or a seasoned hobbyist, we're here to guide and support you every 
                step of the way. Thank you for being part of our Aqua Leads family.
              </p>
              <div className="founder-info">
                <p><strong>Sathsara Dinujaya Peris</strong></p>
                <p>Founder, Aqua Leads Ltd.</p>
              </div>
            </div>
            <div className="about-image">
              <img 
                src="/images/founder.jpg" 
                alt="Founder" 
                className="founder-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Display Slideshow 1 */}
      <section className="display-section">
        <Slideshow images={displayImages} currentSlide={displaySlide1} setSlide={setDisplaySlide1} />
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            {services.map((service, index) => (
              <Link
                to={service.link}
                key={index}
                className="service-card service-card-image"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="service-image-container">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="service-card-img"
                  />
                  <div className="service-overlay">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Section */}
      <section className="maintenance-section">
        <div className="container">
          <div className="maintenance-content">
            <div className="maintenance-text">
              <h2 className="maintenance-title">Zero Maintenance Tanks?</h2>
              <p>
                Invented and developed by Aqua Leads, our Zero Maintenance 
                Aquarium technology allows you to completely set on their own. No filters, 
                no air pumps, no water changes, no fish feeding. It's a natural living 
                ecosystem. Ideal for anyone who wants the beauty of an aquarium 
                without the work. Easy, effective, silent, clean, and built to last.
              </p>
            </div>
            <div className="maintenance-image">
              <img 
                src="/images/zero2.jpg" 
                alt="Zero Maintenance Tank" 
                className="maintenance-tank"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scenariums Section */}
      <section className="scenariums-section">
        <div className="container">
          <div className="scenariums-content">
            <div className="scenariums-image">
              <img 
                src="/images/beautiful_aquascape.jpg" 
                alt="Scenarium" 
                className="scenarium-image"
              />
            </div>
            <div className="scenariums-text">
              <h2 className="scenariums-title">Scenariums</h2>
              <p>
                At Aqualeads, we introduce Scenarium — our original concept that blends the beauty of a paludarium with innovative design. A Scenarium is a carefully crafted living landscape built inside a tank, where water, terrain, and plant life come together to form a stunning natural scene. This unique creation is exclusive to Aqualeads, offering a one-of-a-kind experience in aquatic and terrestrial art.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nature Slideshow */}
      <section className="nature-section">
        <Slideshow images={natureImages} currentSlide={natureSlide} setSlide={setNatureSlide} />
      </section>

      {/* Why Choose Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="why-choose-content">
            <div className="why-choose-text">
              <h2 className="why-choose-title">Why choose us?</h2>
              <p>
                At Aqualeads, we go beyond ordinary design — we create living art. From our signature Scenarium concept to all types of aquascapes and 'ariums' including aquariums, terrariums, paludariums, vivariums and more, we bring nature to life with precision and creativity. Our team specializes in fast, high-quality builds and professional maintenance services to keep your ecosystems thriving. With 24/7 availability, expert craftsmanship, and passion for natural design, Aqualeads stands as your trusted partner for building and caring for breathtaking living environments.
              </p>
            </div>
            <div className="why-choose-images">
              <img 
                src="/images/why1.jpeg" 
                alt="Aquascaping Work" 
                className="work-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Display Slideshow 2 */}
      <section className="display-section">
        <Slideshow images={displayImages2} currentSlide={displaySlide2} setSlide={setDisplaySlide2} />
      </section>

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
                  <li><a href="https://maps.app.goo.gl/jTAo4tTUHudDjMt47?g_st=ipc" target="_blank" rel="noopener noreferrer">Google Map</a></li>
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

export default HomePage;