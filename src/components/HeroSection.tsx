import React from "react";

const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          {/* Left Column - Main Content */}
          <div>
            <div className="hero-content">
              <h1 className="hero-title">
                Premium Transportation
                <span className="hero-subtitle">You Can Trust</span>
              </h1>
              <p className="hero-description">
                Experience luxury, reliability, and exceptional service with ROB Transportation. 
                Your journey matters to us.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="hero-benefits">
              <div className="hero-benefit">
                <div className="hero-check-icon">
                  <span className="hero-check-text">✓</span>
                </div>
                <span className="hero-benefit-text">Competitive Pricing</span>
              </div>
              
              <div className="hero-benefit">
                <div className="hero-check-icon">
                  <span className="hero-check-text">✓</span>
                </div>
                <span className="hero-benefit-text">Luxury Vehicles</span>
              </div>
              
              <div className="hero-benefit">
                <div className="hero-check-icon">
                  <span className="hero-check-text">✓</span>
                </div>
                <span className="hero-benefit-text">Professional Drivers</span>
              </div>
              
              <div className="hero-benefit">
                <div className="hero-check-icon">
                  <span className="hero-check-text">✓</span>
                </div>
                <span className="hero-benefit-text">Airport Specialists</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-indicators">
              <div className="hero-trust-item">
                <div className="hero-trust-number">1000+</div>
                <div className="hero-trust-label">Happy Customers</div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-number">4.9★</div>
                <div className="hero-trust-label">Average Rating</div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-number">24/7</div>
                <div className="hero-trust-label">Service Available</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Element - Hidden on mobile */}
          <div className="hero-visual hidden-mobile">
            <div className="hero-card">
              <div>
                <div className="hero-card-header">
                  <h3 className="hero-card-title">Ready to Book?</h3>
                  <p className="hero-card-subtitle">Get your quote in seconds</p>
                </div>
                
                {/* Quick Stats */}
                <div className="hero-stats">
                  <div className="hero-stat">
                    <div className="hero-stat-number">Multiple</div>
                    <div className="hero-stat-label">Vehicle Types</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-number">Affordable</div>
                    <div className="hero-stat-label">Price</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-number">30min</div>
                    <div className="hero-stat-label">Free Wait</div>
                  </div>
                </div>

                {/* CTA Arrow */}
                <div className="hero-arrow">
                  <div className="hero-arrow-button">
                    <span className="hero-arrow-icon">↓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
