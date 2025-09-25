import React from 'react';

type BlogPostProps = {
  onNavigateBack: () => void;
  onNavigateHome?: () => void;
  onNavigateToPost?: (postId: string) => void;
};

const SeattleAreaEventsTransportation: React.FC<BlogPostProps> = ({ onNavigateBack, onNavigateHome, onNavigateToPost }) => {
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
            Seattle Area Events & Transportation: Your Complete 2025 Event Planning Guide
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
              <span className="text-sm">10 min read</span>
            </div>
            <div className="flex flex-col items-end">
              <span>Published: January 5, 2025</span>
              <span className="text-sm">Updated: January 5, 2025</span>
            </div>
          </div>
          <div className="h-1 w-20 bg-brand-primary rounded"></div>
        </header>

        {/* Featured Image Placeholder */}
        <div className="mb-8 h-64 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-semibold">Seattle Events & Transportation</span>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article Content */}
          <article className="flex-1 prose prose-lg max-w-none">
          {/* Introduction */}
          <div id="overview" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seattle's Vibrant Event Scene</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Seattle's dynamic cultural scene means there's always something exciting happening, from 
              Seahawks games and major concerts to conventions and festivals. With so many events 
              throughout the year, planning your transportation is crucial for a stress-free experience.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              As a transportation expert serving the Seattle area for over a decade, I've learned the 
              ins and outs of event transportation. This comprehensive guide will help you navigate 
              Seattle's busiest venues and events with confidence.
            </p>
          </div>

          {/* Major Venues */}
          <div id="major-venues" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Seattle's Major Event Venues</h2>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🏟️ Sports Venues</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Lumen Field</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> Seahawks, Sounders FC, concerts</li>
                    <li><strong>Capacity:</strong> 68,740 (football), 37,722 (soccer)</li>
                    <li><strong>Parking:</strong> Limited, book transportation early</li>
                    <li><strong>Best Drop-off:</strong> South parking lots</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Climate Pledge Arena</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> Kraken hockey, concerts, shows</li>
                    <li><strong>Capacity:</strong> 17,100 (hockey), 18,600 (concerts)</li>
                    <li><strong>Parking:</strong> Very limited, premium pricing</li>
                    <li><strong>Best Drop-off:</strong> Main entrance on Thomas St</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎭 Entertainment Venues</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Paramount Theatre</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> Broadway shows, concerts, comedy</li>
                    <li><strong>Capacity:</strong> 2,807</li>
                    <li><strong>Location:</strong> Downtown Seattle</li>
                    <li><strong>Transportation:</strong> Easy access, valet available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Moore Theatre</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> Concerts, plays, comedy shows</li>
                    <li><strong>Capacity:</strong> 1,420</li>
                    <li><strong>Location:</strong> Belltown</li>
                    <li><strong>Transportation:</strong> Street parking limited</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🏢 Convention Centers</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Seattle Convention Center</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> PAX West, Emerald City Comic Con</li>
                    <li><strong>Capacity:</strong> 415,700 sq ft</li>
                    <li><strong>Location:</strong> Downtown Seattle</li>
                    <li><strong>Transportation:</strong> Multiple drop-off points</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Washington State Convention Center</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Events:</strong> Business conferences, trade shows</li>
                    <li><strong>Capacity:</strong> 414,000 sq ft</li>
                    <li><strong>Location:</strong> Downtown Seattle</li>
                    <li><strong>Transportation:</strong> Convenient access via I-5</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Events */}
          <div id="annual-events" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Seattle's Major Annual Events</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Attendance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking Window</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transportation Tips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Seahawks Season</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Sept-Jan</td>
                    <td className="px-6 py-4 text-sm text-gray-900">68,740 per game</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2-4 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Book immediately when schedule releases</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">PAX West</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Labor Day Weekend</td>
                    <td className="px-6 py-4 text-sm text-gray-900">80,000+</td>
                    <td className="px-6 py-4 text-sm text-gray-900">4-6 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Multiple hotels, book early</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Emerald City Comic Con</td>
                    <td className="px-6 py-4 text-sm text-gray-900">March</td>
                    <td className="px-6 py-4 text-sm text-gray-900">90,000+</td>
                    <td className="px-6 py-4 text-sm text-gray-900">3-5 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Cosplay-friendly vehicles needed</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Bumbershoot</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Labor Day Weekend</td>
                    <td className="px-6 py-4 text-sm text-gray-900">50,000+</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2-4 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Multiple venue locations</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Seattle International Film Festival</td>
                    <td className="px-6 py-4 text-sm text-gray-900">May-June</td>
                    <td className="px-6 py-4 text-sm text-gray-900">150,000+</td>
                    <td className="px-6 py-4 text-sm text-gray-900">1-3 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Multiple theater venues</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Seafair</td>
                    <td className="px-6 py-4 text-sm text-gray-900">July-August</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2 million+</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2-4 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Multiple event locations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transportation Strategies */}
          <div id="transportation-strategies" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Transportation Strategies</h2>
            
            <div className="bg-orange-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Pre-Event Planning</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li><strong>Research Venue Details:</strong> Check parking availability, drop-off zones, and traffic patterns</li>
                <li><strong>Timing Considerations:</strong> Allow extra time for traffic, security, and finding your seat</li>
                <li><strong>Weather Planning:</strong> Seattle weather can impact travel times significantly</li>
                <li><strong>Group Coordination:</strong> For group events, establish meeting points and backup plans</li>
                <li><strong>Cost Budgeting:</strong> Event transportation often costs 2-3x normal rates</li>
              </ul>
            </div>

            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Common Event Transportation Challenges</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Surge Pricing:</strong> Expect 50-200% price increases during major events</li>
                <li><strong>Limited Availability:</strong> Popular transportation services book up quickly</li>
                <li><strong>Traffic Congestion:</strong> Event traffic can double normal travel times</li>
                <li><strong>Parking Shortages:</strong> Many venues have limited or expensive parking</li>
                <li><strong>Post-Event Delays:</strong> Everyone leaves at once, causing transportation bottlenecks</li>
              </ul>
            </div>
          </div>

          {/* Venue-Specific Tips */}
          <div id="venue-tips" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Venue-Specific Transportation Tips</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lumen Field Events</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Arrival:</strong> Arrive 60-90 minutes early for Seahawks games</li>
                  <li><strong>Departure:</strong> Book return transportation 30 minutes after event ends</li>
                  <li><strong>Drop-off:</strong> Use South parking lots for easiest access</li>
                  <li><strong>Weather:</strong> Covered walkways available from parking areas</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Climate Pledge Arena</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Arrival:</strong> Arrive 45-60 minutes early for concerts</li>
                  <li><strong>Departure:</strong> Post-event traffic is heavy, book return ride</li>
                  <li><strong>Access:</strong> Main entrance on Thomas Street is most convenient</li>
                  <li><strong>Parking:</strong> Very limited, transportation highly recommended</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Convention Centers</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Arrival:</strong> Arrive 30-45 minutes early for registration</li>
                  <li><strong>Multiple Days:</strong> Consider multi-day transportation packages</li>
                  <li><strong>Group Bookings:</strong> Larger groups can get volume discounts</li>
                  <li><strong>Business Hours:</strong> Morning and evening rush hours are busiest</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Theater District</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Arrival:</strong> Arrive 30 minutes early for shows</li>
                  <li><strong>Intermission:</strong> Consider valet service for convenience</li>
                  <li><strong>Dining:</strong> Book transportation to nearby restaurants</li>
                  <li><strong>Evening Shows:</strong> Downtown traffic is lighter after 7 PM</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cost Considerations */}
          <div id="cost-considerations" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Transportation Cost Guide</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💰 Typical Event Pricing</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Regular Events</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Standard Rate:</strong> $60-80 round trip</li>
                    <li><strong>Peak Hours:</strong> +50% surcharge</li>
                    <li><strong>Group Discounts:</strong> 10-20% off for 4+ passengers</li>
                    <li><strong>Multi-Day:</strong> 15-25% discount for 3+ days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Major Events</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>Standard Rate:</strong> $100-150 round trip</li>
                    <li><strong>Surge Pricing:</strong> +100-200% during peak demand</li>
                    <li><strong>Premium Service:</strong> $150-250 for luxury vehicles</li>
                    <li><strong>Last-Minute:</strong> +50-100% additional fee</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-brand-primary text-white p-8 rounded-lg text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Ready for Your Next Seattle Event?</h2>
            <p className="text-xl mb-6">
              Don't let transportation stress ruin your event experience. Book with Rob Transportation 
              and arrive in style, on time, and stress-free.
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
              Seattle's vibrant event scene offers endless entertainment opportunities, but proper 
              transportation planning is essential for a smooth experience. Whether you're attending 
              a Seahawks game, concert, or convention, advance planning will save you time, money, 
              and stress.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Remember, the key to successful event transportation is booking early, allowing extra 
              time for traffic, and choosing a reliable service that understands Seattle's unique 
              challenges. With the right planning, you can focus on enjoying the event instead of 
              worrying about transportation.
            </p>
          </div>
          </article>

          {/* Sidebar with Table of Contents */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
                <ul className="space-y-2">
                  <li><a href="#overview" className="text-brand-primary hover:text-blue-700 block py-1">Seattle's Event Scene</a></li>
                  <li><a href="#major-venues" className="text-brand-primary hover:text-blue-700 block py-1">Major Event Venues</a></li>
                  <li><a href="#annual-events" className="text-brand-primary hover:text-blue-700 block py-1">Annual Events Calendar</a></li>
                  <li><a href="#transportation-strategies" className="text-brand-primary hover:text-blue-700 block py-1">Transportation Strategies</a></li>
                  <li><a href="#venue-tips" className="text-brand-primary hover:text-blue-700 block py-1">Venue-Specific Tips</a></li>
                  <li><a href="#cost-considerations" className="text-brand-primary hover:text-blue-700 block py-1">Cost Considerations</a></li>
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
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToPost?.('seattle-airport-guide')}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Seattle Airport Transportation Guide</h4>
              <p className="text-gray-600 mb-4">Everything you need to know about getting to and from Seattle-Tacoma International Airport.</p>
              <span className="text-brand-primary hover:text-blue-700 font-semibold">Read More →</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToPost?.('best-time-to-book')}>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Best Time to Book Your Ride</h4>
              <p className="text-gray-600 mb-4">Tips for getting the best rates and availability for your transportation needs.</p>
              <span className="text-brand-primary hover:text-blue-700 font-semibold">Read More →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeattleAreaEventsTransportation;
