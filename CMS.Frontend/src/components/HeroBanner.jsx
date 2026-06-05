import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import advertisementService from '../services/advertisementService';
import './HeroBanner.css';

export default function HeroBanner() {
  const [ads, setAds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    advertisementService.getAll().then(data => {
      if (data && data.length > 0) {
        setAds(data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [ads.length]);

  if (ads.length === 0) return null;

  return (
    <div className="hero-banner">
      <div className="banner-slider" style={{ transform: `translateX(-${currentIdx * 100}%)` }}>
        {ads.map(ad => (
          <div key={ad.id} className="banner-slide">
            {/* Fallback pattern if no image */}
            <div className="banner-bg" style={{ backgroundImage: `url(http://localhost:5035${ad.imageUrl})` }}></div>
            <div className="banner-content">
              <h2>{ad.title}</h2>
              <p>{ad.description}</p>
              {ad.targetLink && (
                <Link to={ad.targetLink} className="btn-banner">Mua ngay</Link>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {ads.length > 1 && (
        <div className="banner-dots">
          {ads.map((_, idx) => (
            <button 
              key={idx} 
              className={`dot ${idx === currentIdx ? 'active' : ''}`}
              onClick={() => setCurrentIdx(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
