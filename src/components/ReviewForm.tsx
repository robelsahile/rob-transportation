import React, { useState } from "react";

interface ReviewFormData {
  name: string;
  location: string;
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  onSubmit: (review: ReviewFormData) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    location: "",
    rating: 0,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || formData.rating === 0 || !formData.comment) {
      alert("Please fill in all fields and select a rating.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        name: "",
        location: "",
        rating: 0,
        comment: ""
      });
      
      alert("Thank you for your review! It has been submitted successfully.");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("There was an error submitting your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        className={`w-8 h-8 transition-colors duration-200 ${
          index < rating 
            ? 'text-yellow-400 hover:text-yellow-500' 
            : 'text-gray-300 hover:text-yellow-400'
        } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={interactive ? () => handleRatingClick(index + 1) : undefined}
        disabled={!interactive}
        aria-label={`Rate ${index + 1} star${index !== 0 ? 's' : ''}`}
        title={`Rate ${index + 1} star${index !== 0 ? 's' : ''}`}
      >
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-brand-text mb-6 text-center">
        Share Your Experience
      </h3>
      <p className="text-brand-text-light mb-8 text-center">
        We'd love to hear about your ROB Transportation experience. Your feedback helps us improve our service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors duration-200"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Location Field */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-brand-text mb-2">
            Your Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors duration-200"
            placeholder="e.g., Seattle, WA"
            required
          />
        </div>

        {/* Rating Field */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">
            Your Rating *
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(formData.rating, true)}
            <span className="ml-3 text-sm text-brand-text-light">
              {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Click to rate'}
            </span>
          </div>
        </div>

        {/* Comment Field */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-brand-text mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors duration-200 resize-none"
            placeholder="Tell us about your experience with ROB Transportation..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-primary hover:bg-blue-700 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
