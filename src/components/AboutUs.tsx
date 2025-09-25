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

        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Story</h2>
          
          {/* Image with float-left styling for text wrapping */}
          <div className="float-left mr-6 mb-4 w-56 h-50">
            <img 
              src="/IMG_9142.jpg " 
              alt="ROB Transportation - Professional Transportation Service - Robel Sahile Founder and CEO" 
              className="w-full h-full object-cover object-top rounded-xl shadow-black/70 shadow-xl hover:shadow-black/90 hover:shadow-2xl transition-shadow duration-300 border-2 border-white"
            />
          </div>
          
          {/* Text content that flows around the image */}
          <div className="text-gray-800 leading-relaxed">
            <p className="mb-3">
              Welcome to <strong className="text-brand-primary font-bold">Rob Transportation</strong> — a company built from the ground up with hard work, determination, and a vision for something greater.
            </p>

            <p className="mb-3">
              After working in the tech industry as an engineer, I, like many in today's world, faced a sudden layoff that completely changed my path. To support myself and my family, I turned to driving for ridesharing companies. It was there that I noticed a major gap: while booking a ride was easy, reliable service was not. Consistency and professionalism were often missing, and coverage outside major city centers was limited. Most importantly, these services struggled with scheduled pickups and advance bookings, leaving travelers without the peace of mind they needed to make their journeys stress-free.
            </p>

            <p className="mb-3">
              That experience became the foundation for Rob Transportation. We set out to solve these challenges — ensuring that travelers catching flights have dependable drivers waiting, cruise passengers arriving in Seattle enjoy stress-free transfers, and professionals heading to important meetings can rely on scheduled pickups. We knew we could build something better.
            </p>
            
            <div className="clear-both"></div>
            <p className="mb-3">
              Drawing on my background in technology, we built Rob Transportation from scratch. Every detail — from the booking system on this website to the service itself — was designed to make travel simpler, more reliable, and more professional for people in and around Seattle. What began as one person's determination has grown into a company committed to serving the region with trust, punctuality, and comfort.
            </p>
            
            <p className="mb-3">
              Today, Rob Transportation proudly serves Seattle and beyond, helping customers reach airports, cruise terminals, business meetings, and special occasions with confidence and peace of mind. With loyal, dedicated drivers and a network of over 100 contractors, we ensure that every ride is covered. More than just getting from point A to point B, our mission is to deliver a service that travelers can rely on — every time.
            </p>
            
            <p className="mb-3">
              This is the story of Rob Transportation — built on technology, shaped by experience, and driven by the belief that every journey deserves to be seamless. Seattle is our home, and serving its people and visitors is our mission. We look forward to driving you.
            </p>
          </div>
          
          {/* Clear float to ensure proper layout */}
          <div className="clear-both"></div>
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
              <span className="text-white text-2x font-bold">1000+</span>
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
              At Rob Transportation, our mission is to provide travelers in the <strong className="italic text-gray-650">Seattle metropolitan area</strong> with reliable, professional, and stress-free transportation. From airport transfers to cruise rides and scheduled pickups for business or special occasions, we are dedicated to delivering trusted drivers and a seamless booking experience that gives our customers peace of mind every step of the way.
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
