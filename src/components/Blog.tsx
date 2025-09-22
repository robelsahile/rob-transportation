import React from 'react';

type BlogProps = {
  onNavigateHome: () => void;
};

const Blog: React.FC<BlogProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">Blog</h1>
          <p className="text-gray-600 text-lg">Stay updated with the latest transportation news and tips</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog Post 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-brand-primary to-blue-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Seattle Airport Transportation Guide</h3>
              <p className="text-gray-600 mb-4">Everything you need to know about getting to and from Seattle-Tacoma International Airport.</p>
              <div className="text-sm text-gray-500">January 15, 2025</div>
            </div>
          </article>

          {/* Blog Post 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-green-500 to-teal-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Best Time to Book Your Ride</h3>
              <p className="text-gray-600 mb-4">Tips for getting the best rates and availability for your transportation needs.</p>
              <div className="text-sm text-gray-500">January 10, 2025</div>
            </div>
          </article>

          {/* Blog Post 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Seattle Area Events & Transportation</h3>
              <p className="text-gray-600 mb-4">How to plan your transportation for major events in the Seattle metropolitan area.</p>
              <div className="text-sm text-gray-500">January 5, 2025</div>
            </div>
          </article>
        </div>

        <div className="text-center mt-12">
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

export default Blog;
