import React from 'react';

type BlogPostProps = {
  onNavigateBack: () => void;
  onNavigateHome?: () => void;
  onNavigateToPost?: (postId: string) => void;
};

const SeattleAirportTransportationGuide: React.FC<BlogPostProps> = ({ onNavigateBack, onNavigateHome, onNavigateToPost }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          className="mb-6 text-brand-primary hover:text-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </button>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Seattle Airport Transportation Guide: Your Complete 2025 Resource
          </h1>
          <div className="flex justify-between items-center text-gray-700 mb-4">
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <img 
                  src="/IMG_9142.jpg" 
                  alt="Rob Sahile" 
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
                <span>Robel Sahile</span>
              </div>
              <span className="text-sm">12 min read</span>
            </div>
            <div className="flex flex-col items-end">
              <span>Published: January 15, 2025</span>
              <span className="text-sm">Updated: January 15, 2025</span>
            </div>
          </div>
          <div className="h-1 w-20 bg-brand-primary rounded"></div>
        </header>

        {/* Featured Image */}
        <div className="mb-8 h-64 bg-gradient-to-r from-brand-primary to-blue-600 rounded-xl flex items-center justify-center relative overflow-hidden border-2 border-white shadow-lg">
          <img 
            src="/blog-images/seattle-airport-transportation.webp" 
            alt="Seattle-Tacoma International Airport Transportation" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-white text-lg font-semibold z-10 relative drop-shadow-lg">Seattle-Tacoma International Airport</span>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article Content */}
          <article className="flex-1 prose prose-lg max-w-none">
          {/* Introduction */}
          <div id="overview" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seattle Airport Overview</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Seattle-Tacoma International Airport (SEA) serves as the primary gateway to the Pacific Northwest, 
              handling over 50 million passengers annually. Whether you're arriving for business, leisure, or 
              connecting to other destinations, understanding your transportation options is crucial for a 
              smooth journey.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Located approximately 14 miles south of downtown Seattle, SEA offers multiple transportation 
              methods ranging from budget-friendly public transit to premium private services. This comprehensive 
              guide will help you choose the best option based on your budget, schedule, and comfort preferences.
            </p>
          </div>

          {/* Public Transportation */}
          <div id="public-transport" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Public Transportation Options</h2>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚊 Link Light Rail</h3>
              <p className="text-gray-700 mb-4">
                The Link Light Rail is Seattle's most popular airport transportation option, offering 
                reliable service directly from SEA to downtown Seattle and beyond.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Duration:</strong> 35-40 minutes to downtown Seattle</li>
                <li><strong>Frequency:</strong> Every 6-10 minutes during peak hours</li>
                <li><strong>Operating Hours:</strong> 5:00 AM - 1:00 AM daily</li>
                <li><strong>Fare:</strong> $3.25 for adults, $1.50 for seniors/disabled</li>
                <li><strong>Stations:</strong> Airport Station to University of Washington</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚌 King County Metro Bus</h3>
              <p className="text-gray-700 mb-4">
                Metro Transit provides several bus routes connecting SEA to various Seattle neighborhoods 
                and surrounding cities.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Route 124:</strong> Direct service to downtown Seattle</li>
                <li><strong>Route 560:</strong> Service to Bellevue and Eastside</li>
                <li><strong>Fare:</strong> $2.75 for adults (ORCA card), $3.00 cash</li>
                <li><strong>Frequency:</strong> Every 15-30 minutes depending on route</li>
              </ul>
            </div>
          </div>

          {/* Private Transportation */}
          <div id="private-transport" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Private Transportation Services</h2>
            
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚕 Traditional Taxis</h3>
              <p className="text-gray-700 mb-4">
                Taxis offer convenience and direct service but come at a premium price. They're available 
                at designated pickup areas on the third floor of the parking garage.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Pickup Location:</strong> Third floor of parking garage</li>
                <li><strong>Average Fare to Downtown:</strong> $45-55</li>
                <li><strong>Payment:</strong> Cash, credit cards, or mobile payments</li>
                <li><strong>Wait Time:</strong> Usually immediate availability</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚐 Airport Shuttle Services</h3>
              <p className="text-gray-700 mb-4">
                Shared and private shuttle services provide a middle-ground option between public transit 
                and private cars.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Shared Shuttles:</strong> $25-35 per person</li>
                <li><strong>Private Shuttles:</strong> $60-80 for up to 4 passengers</li>
                <li><strong>Booking:</strong> Advance reservation recommended</li>
                <li><strong>Popular Services:</strong> Rob Transportation, Seattle Express, Shuttle Express</li>
              </ul>
            </div>
          </div>

          {/* Rideshare Services */}
          <div id="rideshare" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Rideshare Services (Uber & Lyft)</h2>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Uber and Lyft have revolutionized airport transportation, offering competitive pricing 
              and convenient app-based booking. Both services operate from designated pickup areas.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Uber Options</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>UberX:</strong> $60-70 to downtown</li>
                  <li><strong>UberXL:</strong> $80-90 for larger groups</li>
                  <li><strong>Uber Black:</strong> $90-120 premium service</li>
                  <li><strong>Wait Time:</strong> 5-15 minutes typically</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lyft Options</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Lyft:</strong> $60-70 to downtown</li>
                  <li><strong>Lyft XL:</strong> $70-80 for larger groups</li>
                  <li><strong>Lyft Lux:</strong> $80-110 premium service</li>
                  <li><strong>Wait Time:</strong> 5-15 minutes typically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Car Rental */}
          <div id="car-rental" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Car Rental Options</h2>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              SEA features a consolidated rental car facility located off-site, accessible via 
              complimentary shuttle service. This modern facility houses all major rental companies 
              under one roof.
            </p>

            <div className="bg-orange-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rental Car Details</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Shuttle Service:</strong> Free, runs every 5-10 minutes</li>
                <li><strong>Shuttle Duration:</strong> 10-15 minutes from terminal</li>
                <li><strong>Major Companies:</strong> Hertz, Enterprise, Avis, Budget, National, Alamo</li>
                <li><strong>Average Daily Rate:</strong> $40-80 depending on vehicle type</li>
                <li><strong>Operating Hours:</strong> 6:00 AM - 11:00 PM most companies</li>
              </ul>
            </div>
          </div>

          {/* Cost Comparison */}
          <div id="cost-comparison" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost Comparison: Airport to Downtown Seattle</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transportation Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost (1 person)</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Link Light Rail</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$3.25</td>
                    <td className="px-6 py-4 text-sm text-gray-900">35-40 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Budget travelers</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Metro Bus</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$2.75</td>
                    <td className="px-6 py-4 text-sm text-gray-900">45-60 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Budget travelers</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Uber/Lyft</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$60-120</td>
                    <td className="px-6 py-4 text-sm text-gray-900">25-35 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Convenience</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Taxi</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$55-70</td>
                    <td className="px-6 py-4 text-sm text-gray-900">25-35 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Immediate availability</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Shared Shuttle</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$25-35</td>
                    <td className="px-6 py-4 text-sm text-gray-900">45-60 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Small groups</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Private Shuttle</td>
                    <td className="px-6 py-4 text-sm text-gray-900">$60-80</td>
                    <td className="px-6 py-4 text-sm text-gray-900">30-45 min</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Groups of 4+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pro Tips */}
          <div id="tips" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Pro Tips for Travelers</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Insider Secrets</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li><strong>Peak Hours:</strong> Avoid 7-9 AM and 4-6 PM for faster travel times</li>
                <li><strong>Weather Delays:</strong> Allow extra time during Seattle's rainy season (October-March)</li>
                <li><strong>ORCA Card:</strong> Get an ORCA card for seamless public transit transfers</li>
                <li><strong>App Downloads:</strong> Download transit apps like OneBusAway for real-time updates</li>
                <li><strong>Luggage Storage:</strong> Light rail and buses have limited luggage space</li>
                <li><strong>Airport WiFi:</strong> Free WiFi available throughout SEA for booking rides</li>
              </ul>
            </div>
          </div>

          {/* Accessibility */}
          <div id="accessibility" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Accessibility Options</h2>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              SEA is committed to providing accessible transportation for all travelers. Here are the 
              available options for passengers with mobility needs:
            </p>

            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Accessible Light Rail:</strong> All Link stations and trains are wheelchair accessible</li>
              <li><strong>Accessible Buses:</strong> King County Metro buses are equipped with wheelchair ramps</li>
              <li><strong>Accessible Taxis:</strong> Wheelchair-accessible taxis available at designated areas</li>
              <li><strong>Accessible Rideshare:</strong> Uber and Lyft offer accessible vehicle options</li>
              <li><strong>Accessible Shuttles:</strong> Most shuttle services provide accessible vehicles</li>
              <li><strong>Personal Vehicles:</strong> Accessible parking available in airport garage</li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="bg-brand-primary text-white p-8 rounded-lg text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Book Your Seattle Airport Transportation?</h2>
            <p className="text-xl mb-6">
              Don't let transportation stress ruin your Seattle experience. Book your reliable, 
              comfortable ride with Rob Transportation today.
            </p>
            <button 
              onClick={onNavigateHome}
              className="bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Now
            </button>
          </div>

          {/* Conclusion */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Final Thoughts</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Choosing the right transportation option from Seattle-Tacoma International Airport depends on 
              your budget, schedule, and comfort preferences. While public transit offers the best value, 
              private services provide unmatched convenience and comfort.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              For business travelers and those seeking reliability, consider booking with a professional 
              transportation service. With advance planning and the right choice, your journey from SEA 
              can be the perfect start to your Seattle adventure.
            </p>
          </div>
          </article>

          {/* Sidebar with Table of Contents */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
                <ul className="space-y-2">
                  <li><a href="#overview" className="text-brand-primary hover:text-blue-700 block py-1">Seattle Airport Overview</a></li>
                  <li><a href="#public-transport" className="text-brand-primary hover:text-blue-700 block py-1">Public Transportation Options</a></li>
                  <li><a href="#private-transport" className="text-brand-primary hover:text-blue-700 block py-1">Private Transportation Services</a></li>
                  <li><a href="#rideshare" className="text-brand-primary hover:text-blue-700 block py-1">Rideshare Services (Uber & Lyft)</a></li>
                  <li><a href="#car-rental" className="text-brand-primary hover:text-blue-700 block py-1">Car Rental Options</a></li>
                  <li><a href="#cost-comparison" className="text-brand-primary hover:text-blue-700 block py-1">Cost Comparison</a></li>
                  <li><a href="#tips" className="text-brand-primary hover:text-blue-700 block py-1">Pro Tips for Travelers</a></li>
                  <li><a href="#accessibility" className="text-brand-primary hover:text-blue-700 block py-1">Accessibility Options</a></li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Author Bio */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img 
                src="/IMG_9142.jpg" 
                alt="Rob Sahile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Robel Sahile</h3>
              <p className="text-gray-700">
                Founder and CEO of Rob Transportation, I've been serving the Seattle area for over a decade. 
                I'm passionate about helping travelers navigate the Pacific Northwest with comfort, 
                reliability, and exceptional service. When I'm not ensuring smooth rides for my clients, 
                you can find me exploring the beautiful Pacific Northwest.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToPost?.('best-time-to-book')}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Best Time to Book Your Ride</h4>
              <p className="text-gray-600 mb-4">Tips for getting the best rates and availability for your transportation needs.</p>
              <span className="text-brand-primary hover:text-blue-700 font-semibold">Read More →</span>
            </div>
            <div className="bg-white p-6 rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToPost?.('seattle-events')}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Seattle Area Events & Transportation</h4>
              <p className="text-gray-600 mb-4">How to plan your transportation for major events in the Seattle metropolitan area.</p>
              <span className="text-brand-primary hover:text-blue-700 font-semibold">Read More →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeattleAirportTransportationGuide;
