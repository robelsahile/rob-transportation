import React from "react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Seattle, WA",
    rating: 5,
    comment: "Exceptional service! The driver was professional, the car was spotless, and we arrived at the airport with time to spare. Will definitely book again.",
    service: "Airport Transfer",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Bellevue, WA",
    rating: 5,
    comment: "ROB Transportation made our wedding day perfect. The luxury sedan was beautiful and the driver was incredibly courteous. Highly recommend for special occasions!",
    service: "Wedding Transportation",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Tacoma, WA",
    rating: 5,
    comment: "Business trip made easy! Professional service, clean vehicle, and on-time pickup. The SUV had plenty of space for my luggage and laptop setup.",
    service: "Business Travel",
    date: "3 days ago"
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Redmond, WA",
    rating: 5,
    comment: "Group of 8 for a corporate event - the executive van was perfect! Comfortable ride for everyone and the driver handled Seattle traffic like a pro.",
    service: "Corporate Event",
    date: "5 days ago"
  },
  {
    id: 5,
    name: "Lisa Park",
    location: "Kirkland, WA",
    rating: 5,
    comment: "Late night pickup from the airport - driver was waiting exactly where promised. Clean car, safe driving, and fair pricing. Couldn't ask for more!",
    service: "Late Night Pickup",
    date: "1 week ago"
  },
  {
    id: 6,
    name: "James Wilson",
    location: "Everett, WA",
    rating: 5,
    comment: "Regular customer here - consistent quality every time. The booking system is easy to use and the drivers are always professional and punctual.",
    service: "Regular Customer",
    date: "4 days ago"
  }
];

const TestimonialsSection: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-brand-text-light max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about their ROB Transportation experience.
          </p>
          
          {/* Overall Rating Summary */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-primary">4.9</div>
              <div className="flex justify-center">{renderStars(5)}</div>
              <div className="text-sm text-brand-text-light">Based on 247 reviews</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Show all testimonials on desktop */}
          <div className="hidden md:contents">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <span className="ml-2 text-sm text-brand-text-light">{testimonial.date}</span>
                </div>

                {/* Comment */}
                <blockquote className="text-brand-text mb-4 italic">
                  "{testimonial.comment}"
                </blockquote>

                {/* Service Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-brand-primary text-white text-xs px-3 py-1 rounded-full">
                    {testimonial.service}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-brand-text">{testimonial.name}</div>
                    <div className="text-sm text-brand-text-light">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show only top 3 testimonials on mobile */}
          <div className="md:hidden space-y-6">
            {testimonials.slice(0, 3).map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <span className="ml-2 text-sm text-brand-text-light">{testimonial.date}</span>
                </div>

                {/* Comment */}
                <blockquote className="text-brand-text mb-4 italic">
                  "{testimonial.comment}"
                </blockquote>

                {/* Service Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-brand-primary text-white text-xs px-3 py-1 rounded-full">
                    {testimonial.service}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-brand-text">{testimonial.name}</div>
                    <div className="text-sm text-brand-text-light">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-brand-text mb-4">
              Ready to Experience Premium Transportation?
            </h3>
            <p className="text-brand-text-light mb-6">
              Join hundreds of satisfied customers who trust ROB Transportation for their travel needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">247+</div>
                <div className="text-sm text-brand-text-light">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">4.9★</div>
                <div className="text-sm text-brand-text-light">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">100%</div>
                <div className="text-sm text-brand-text-light">On-Time Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
