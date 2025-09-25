import React from 'react';

type ThankYouPageProps = {
  onNavigateHome: () => void;
  customerName?: string;
};

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigateHome, customerName }) => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Thank You{customerName ? `, ${customerName}` : ''}!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your message has been successfully sent to our team.
          </p>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-brand-primary mb-4">What happens next?</h2>
            <div className="space-y-3 text-left max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-gray-700">
                  <strong>We'll review your message</strong> and get back to you within 2 hours during business hours.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-gray-700">
                  <strong>We'll provide a detailed response</strong> to your inquiry with all the information you need.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-gray-700">
                  <strong>If it's urgent</strong>, feel free to call us directly at <strong>(206) 699-9066</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">📞</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">(206) 699-9066</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">✉️</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">info@robtransportation.com</p>
              <p className="text-sm text-gray-500">Response within 2 hours</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateHome}
              className="bg-brand-primary text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Back to Home
            </button>
            <a
              href="tel:+12066999066"
              className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors font-medium text-lg text-center"
            >
              Call Us Now
            </a>
          </div>

          {/* Additional Message */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-yellow-800">
              <strong>Need immediate assistance?</strong> Don't wait - our team is standing by to help you 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
