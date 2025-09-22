import React from 'react';

type TopCitiesProps = {
  onNavigateHome: () => void;
};

const TopCities: React.FC<TopCitiesProps> = ({ onNavigateHome }) => {
  const seattleAreaCities = [
    { name: 'Seattle', description: 'Downtown Seattle, Capitol Hill, Queen Anne' },
    { name: 'Bellevue', description: 'Bellevue Square, Crossroads, Factoria' },
    { name: 'Redmond', description: 'Microsoft Campus, Redmond Town Center' },
    { name: 'Kirkland', description: 'Kirkland Waterfront, Totem Lake' },
    { name: 'Renton', description: 'Renton Landing, Boeing Field' },
    { name: 'Tacoma', description: 'Tacoma Dome, Point Defiance Park' },
    { name: 'Everett', description: 'Everett Mall, Boeing Factory' },
    { name: 'Bothell', description: 'Bothell Landing, Canyon Park' },
    { name: 'Shoreline', description: 'Shoreline Community College, Aurora Village' },
    { name: 'Federal Way', description: 'Federal Way Transit Center, Wild Waves' },
    { name: 'Kent', description: 'Kent Station, ShoWare Center' },
    { name: 'Auburn', description: 'Auburn Outlet Collection, Muckleshoot Casino' }
  ];

  const popularRoutes = [
    { from: 'Seattle', to: 'Bellevue', duration: '25-35 min' },
    { from: 'Seattle', to: 'Redmond', duration: '30-45 min' },
    { from: 'Seattle', to: 'Tacoma', duration: '35-50 min' },
    { from: 'Bellevue', to: 'Redmond', duration: '15-25 min' },
    { from: 'Seattle', to: 'Everett', duration: '40-60 min' },
    { from: 'Seattle', to: 'Federal Way', duration: '30-45 min' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">Top Cities We Serve</h1>
          <p className="text-gray-600 text-lg">Reliable transportation throughout the Seattle metropolitan area</p>
        </div>

        {/* Cities Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Seattle Area Cities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seattleAreaCities.map((city, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-brand-primary mb-2">{city.name}</h3>
                <p className="text-gray-600 text-sm">{city.description}</p>
                <div className="mt-4">
                  <span className="inline-block bg-brand-primary text-white text-xs px-3 py-1 rounded-full">
                    Available 24/7
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Routes */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Popular Routes</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">→</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{route.from} → {route.to}</div>
                      <div className="text-sm text-gray-600">{route.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Service Areas</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">Airport Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Seattle-Tacoma International Airport (SEA)</li>
                <li>• Boeing Field (BFI)</li>
                <li>• Paine Field (PAE)</li>
                <li>• Airport transfers to all area cities</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-brand-primary mb-4">Special Events</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• T-Mobile Park (Mariners games)</li>
                <li>• Lumen Field (Seahawks games)</li>
                <li>• Climate Pledge Arena (Kraken games)</li>
                <li>• Convention centers and venues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-brand-primary text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Book Your Ride?</h2>
          <p className="text-lg mb-6">Experience reliable transportation throughout the Seattle area</p>
          <button
            onClick={onNavigateHome}
            className="bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Book Now
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onNavigateHome}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopCities;
