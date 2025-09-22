import React from 'react';

type AboutUsProps = {
  onNavigateHome: () => void;
};

const AboutUs: React.FC<AboutUsProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">About ROB Transportation</h1>
          <p className="text-gray-600 text-lg">Your trusted partner for premium transportation services in the Seattle area</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded with a vision to provide exceptional transportation services, ROB Transportation has been serving 
              the Seattle metropolitan area with reliability, comfort, and professionalism. We understand that every 
              journey matters, whether it's a business trip, special event, or airport transfer.
            </p>
            <p className="text-gray-600 mb-4">
              Our commitment to excellence has made us the preferred choice for discerning clients who value 
              punctuality, safety, and superior service. We pride ourselves on our fleet of well-maintained 
              vehicles and our team of experienced, professional drivers.
            </p>
          </div>
          <div className="h-80 bg-gradient-to-r from-brand-primary to-blue-600 rounded-lg"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">5+</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Years of Experience</h3>
            <p className="text-gray-600">Serving the Seattle area with dedication and expertise</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1000+</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Happy Customers</h3>
            <p className="text-gray-600">Satisfied clients who trust us with their transportation needs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">24/7</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Available Service</h3>
            <p className="text-gray-600">Round-the-clock availability for your convenience</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Our Mission</h2>
          <p className="text-gray-600 text-center text-lg leading-relaxed">
            To provide safe, reliable, and comfortable transportation services that exceed our clients' expectations, 
            while maintaining the highest standards of professionalism and customer service in the Seattle metropolitan area.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onNavigateHome}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
