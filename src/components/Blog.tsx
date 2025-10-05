import React, { useState, useEffect } from 'react';
import SeattleAirportTransportationGuide from './blog-posts/SeattleAirportTransportationGuide';
import BestTimeToBookYourRide from './blog-posts/BestTimeToBookYourRide';
import SeattleAreaEventsTransportation from './blog-posts/SeattleAreaEventsTransportation';

type BlogProps = {
  onNavigateHome: () => void;
  resetToMainPage?: boolean;
  selectedPost?: string | null;
  onPostSelect?: (postId: string | null) => void;
};

const Blog: React.FC<BlogProps> = ({ onNavigateHome, resetToMainPage, selectedPost, onPostSelect }) => {
  const [internalSelectedPost, setInternalSelectedPost] = useState<string | null>(null);
  
  // Use external selectedPost if provided, otherwise use internal state
  const currentSelectedPost = selectedPost !== undefined ? selectedPost : internalSelectedPost;

  const handlePostClick = (postId: string) => {
    if (onPostSelect) {
      onPostSelect(postId);
    } else {
      setInternalSelectedPost(postId);
    }
    // Scroll to top when navigating to a new blog post
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    if (onPostSelect) {
      onPostSelect(null);
    } else {
      setInternalSelectedPost(null);
    }
    // Scroll to top when going back to blog list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top whenever a blog post is selected
  useEffect(() => {
    if (currentSelectedPost) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSelectedPost]);

  // Reset to main blog page when resetToMainPage prop changes
  useEffect(() => {
    if (resetToMainPage) {
      if (onPostSelect) {
        onPostSelect(null);
      } else {
        setInternalSelectedPost(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [resetToMainPage, onPostSelect]);

  // If a specific blog post is selected, render that post
  if (currentSelectedPost === 'seattle-airport-guide') {
    return <SeattleAirportTransportationGuide onNavigateBack={handleBackToBlog} onNavigateHome={onNavigateHome} onNavigateToPost={handlePostClick} />;
  }
  
  if (currentSelectedPost === 'best-time-to-book') {
    return <BestTimeToBookYourRide onNavigateBack={handleBackToBlog} onNavigateHome={onNavigateHome} onNavigateToPost={handlePostClick} />;
  }
  
  if (currentSelectedPost === 'seattle-events') {
    return <SeattleAreaEventsTransportation onNavigateBack={handleBackToBlog} onNavigateHome={onNavigateHome} onNavigateToPost={handlePostClick} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">Blog</h1>
          <p className="text-gray-600 text-lg">Stay updated with the latest transportation news and tips</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog Post 1 */}
          <article 
            className="bg-white rounded-md shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => handlePostClick('seattle-airport-guide')}
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src="/blog-images/seattle-airport-transportation.webp" 
                alt="Seattle Airport Transportation Guide" 
                className="w-full h-full object-cover rounded-t-md"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'block';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-blue-600 hidden"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-brand-primary transition-colors duration-300">Seattle Airport Transportation Guide</h3>
              <p className="text-gray-600 mb-4">Everything you need to know about getting to and from Seattle-Tacoma International Airport.</p>
              <div className="text-sm text-gray-500">January 15, 2025</div>
            </div>
          </article>

          {/* Blog Post 2 */}
          <article 
            className="bg-white rounded-md shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => handlePostClick('best-time-to-book')}
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src="/blog-images/Besttimetobookyourride.png" 
                alt="Best Time to Book Your Ride" 
                className="w-full h-full object-cover rounded-t-md"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'block';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 hidden"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-brand-primary transition-colors duration-300">Best Time to Book Your Ride</h3>
              <p className="text-gray-600 mb-4">Tips for getting the best rates and availability for your transportation needs.</p>
              <div className="text-sm text-gray-500">January 10, 2025</div>
            </div>
          </article>

          {/* Blog Post 3 */}
          <article 
            className="bg-white rounded-md shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => handlePostClick('seattle-events')}
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src="/blog-images/seattleareaevents.png" 
                alt="Seattle Area Events & Transportation" 
                className="w-full h-full object-cover rounded-t-md"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'block';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 hidden"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-brand-primary transition-colors duration-300">Seattle Area Events & Transportation</h3>
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
