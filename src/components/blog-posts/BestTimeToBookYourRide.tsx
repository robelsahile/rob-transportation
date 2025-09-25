import React from 'react';

type BlogPostProps = {
  onNavigateBack: () => void;
  onNavigateHome?: () => void;
  onNavigateToPost?: (postId: string) => void;
};

const BestTimeToBookYourRide: React.FC<BlogPostProps> = ({ onNavigateBack, onNavigateHome, onNavigateToPost }) => {
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
            Best Time to Book Your Ride: Your Complete 2025 Guide to Smart Transportation Planning
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
              <span className="text-sm">8 min read</span>
            </div>
            <div className="flex flex-col items-end">
              <span>Published: January 10, 2025</span>
              <span className="text-sm">Updated: January 10, 2025</span>
            </div>
          </div>
          <div className="h-1 w-20 bg-brand-primary rounded"></div>
        </header>

        {/* Featured Image Placeholder */}
        <div className="mb-8 h-64 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-semibold">Smart Transportation Planning</span>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article Content */}
          <article className="flex-1 prose prose-lg max-w-none">
          {/* Introduction */}
          <div id="overview" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Timing Matters for Your Transportation</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Booking your transportation at the right time can save you money, ensure availability, 
              and guarantee a stress-free experience. Whether you're planning a business trip, 
              family vacation, or special event, understanding the best booking strategies is crucial.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              After years of serving Seattle-area travelers, I've identified key patterns that can 
              help you get the best rates and availability. This guide will reveal the insider secrets 
              to booking smart and saving big on your next ride.
            </p>
          </div>

          {/* Peak vs Off-Peak */}
          <div id="peak-times" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Peak vs Off-Peak: Understanding Demand Patterns</h2>
            
            <div className="bg-red-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🔥 Peak Hours (Higher Prices & Limited Availability)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Morning Rush:</strong> 7:00 AM - 9:00 AM (Business travelers)</li>
                <li><strong>Evening Rush:</strong> 4:00 PM - 6:00 PM (Return commuters)</li>
                <li><strong>Weekend Evenings:</strong> Friday 5:00 PM - 8:00 PM, Saturday 6:00 PM - 10:00 PM</li>
                <li><strong>Holiday Periods:</strong> Major holidays and long weekends</li>
                <li><strong>Event Days:</strong> Seahawks games, concerts, conventions</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💚 Off-Peak Hours (Better Rates & More Availability)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Mid-Morning:</strong> 10:00 AM - 11:30 AM</li>
                <li><strong>Mid-Afternoon:</strong> 1:00 PM - 3:30 PM</li>
                <li><strong>Late Evening:</strong> After 8:00 PM on weekdays</li>
                <li><strong>Weekend Mornings:</strong> Saturday & Sunday before 10:00 AM</li>
                <li><strong>Mid-Week:</strong> Tuesday through Thursday generally offer better rates</li>
              </ul>
            </div>
          </div>

          {/* Advance Booking */}
          <div id="advance-booking" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Far in Advance Should You Book?</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Same Day Bookings</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Best For:</strong> Last-minute needs, flexible schedules</li>
                  <li><strong>Availability:</strong> Limited during peak times</li>
                  <li><strong>Price:</strong> Standard rates, surge pricing possible</li>
                  <li><strong>Tip:</strong> Book early in the day for evening rides</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">1-7 Days Advance</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Best For:</strong> Most regular transportation needs</li>
                  <li><strong>Availability:</strong> Good selection of options</li>
                  <li><strong>Price:</strong> Competitive rates, some discounts</li>
                  <li><strong>Tip:</strong> Book by Wednesday for weekend trips</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">1-4 Weeks Advance</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Best For:</strong> Airport transfers, business trips</li>
                  <li><strong>Availability:</strong> Excellent choice of vehicles</li>
                  <li><strong>Price:</strong> Best rates, early bird discounts</li>
                  <li><strong>Tip:</strong> Perfect for special events</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">1+ Months Advance</h3>
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Best For:</strong> Major events, holidays, group trips</li>
                  <li><strong>Availability:</strong> Guaranteed availability</li>
                  <li><strong>Price:</strong> Lowest rates, group discounts</li>
                  <li><strong>Tip:</strong> Essential for peak season travel</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seasonal Considerations */}
          <div id="seasonal-booking" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Seasonal Booking Strategies</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📅 Month-by-Month Booking Guide</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">High Demand Months</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>December:</strong> Holiday travel, book 6+ weeks ahead</li>
                    <li><strong>July:</strong> Summer tourism, book 4+ weeks ahead</li>
                    <li><strong>September:</strong> Back to school, book 3+ weeks ahead</li>
                    <li><strong>June:</strong> Wedding season, book 4+ weeks ahead</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Moderate Demand Months</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>January-February:</strong> Post-holiday lull, 1-2 weeks ahead</li>
                    <li><strong>March-April:</strong> Spring break varies, 2-3 weeks ahead</li>
                    <li><strong>October:</strong> Fall tourism, 2-3 weeks ahead</li>
                    <li><strong>November:</strong> Pre-holiday, 2-4 weeks ahead</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Cost-Saving Tips */}
          <div id="cost-saving" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Pro Tips to Save Money on Your Rides</h2>
            
            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💰 Money-Saving Strategies</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li><strong>Book Mid-Week:</strong> Tuesday through Thursday typically offer 15-20% lower rates</li>
                <li><strong>Flexible Timing:</strong> Adjust your schedule by 30-60 minutes to avoid peak pricing</li>
                <li><strong>Group Bookings:</strong> Larger vehicles can be more cost-effective per person</li>
                <li><strong>Return Trips:</strong> Book round-trip services for additional discounts</li>
                <li><strong>Regular Customer:</strong> Build relationships with transportation providers for loyalty rates</li>
                <li><strong>Weather Awareness:</strong> Book early before weather events cause demand spikes</li>
              </ul>
            </div>
          </div>

          {/* Special Events */}
          <div id="special-events" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Special Events: When to Book Extra Early</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking Window</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price Impact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Seahawks Games</td>
                    <td className="px-6 py-4 text-sm text-gray-900">2-4 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">+50-100%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Book as soon as schedule is released</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Conventions</td>
                    <td className="px-6 py-4 text-sm text-gray-900">4-6 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">+75-150%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Check convention center schedules</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Concerts</td>
                    <td className="px-6 py-4 text-sm text-gray-900">3-5 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">+40-80%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Venue location matters</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Holidays</td>
                    <td className="px-6 py-4 text-sm text-gray-900">6-8 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">+100-200%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Book before Thanksgiving</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Airport (Holiday)</td>
                    <td className="px-6 py-4 text-sm text-gray-900">4-6 weeks ahead</td>
                    <td className="px-6 py-4 text-sm text-gray-900">+60-120%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Early morning/late night flights</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technology Tips */}
          <div id="tech-tips" className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Leverage Technology for Better Booking</h2>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📱 Smart Booking Apps & Tools</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Price Alerts:</strong> Set up notifications for price drops on your routes</li>
                <li><strong>Calendar Integration:</strong> Sync transportation bookings with your calendar</li>
                <li><strong>Weather Apps:</strong> Monitor weather conditions that might affect demand</li>
                <li><strong>Traffic Monitoring:</strong> Use real-time traffic data to optimize timing</li>
                <li><strong>Loyalty Programs:</strong> Join transportation provider loyalty programs</li>
                <li><strong>Group Booking Tools:</strong> Use apps that offer group discounts</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-brand-primary text-white p-8 rounded-lg text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Book Smart?</h2>
            <p className="text-xl mb-6">
              Don't let poor timing cost you money or stress. Book your next ride with Rob Transportation 
              and experience the difference that smart planning makes.
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
              The key to successful transportation booking is understanding demand patterns and planning accordingly. 
              While last-minute bookings are sometimes necessary, advance planning almost always results in better 
              rates and guaranteed availability.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Remember, the best time to book is when you have the most flexibility in your schedule. 
              Whether it's adjusting your departure time by 30 minutes or booking weeks in advance, 
              small changes can lead to significant savings and peace of mind.
            </p>
          </div>
          </article>

          {/* Sidebar with Table of Contents */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
                <ul className="space-y-2">
                  <li><a href="#overview" className="text-brand-primary hover:text-blue-700 block py-1">Why Timing Matters</a></li>
                  <li><a href="#peak-times" className="text-brand-primary hover:text-blue-700 block py-1">Peak vs Off-Peak Hours</a></li>
                  <li><a href="#advance-booking" className="text-brand-primary hover:text-blue-700 block py-1">Advance Booking Guide</a></li>
                  <li><a href="#seasonal-booking" className="text-brand-primary hover:text-blue-700 block py-1">Seasonal Strategies</a></li>
                  <li><a href="#cost-saving" className="text-brand-primary hover:text-blue-700 block py-1">Cost-Saving Tips</a></li>
                  <li><a href="#special-events" className="text-brand-primary hover:text-blue-700 block py-1">Special Events</a></li>
                  <li><a href="#tech-tips" className="text-brand-primary hover:text-blue-700 block py-1">Technology Tips</a></li>
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
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToPost?.('seattle-events')}>
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

export default BestTimeToBookYourRide;
