import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { submitFeedback } from '../firebase/feedback';
import toast from 'react-hot-toast';

/**
 * FeedbackForm Component
 * Modal form for submitting order feedback with star rating
 * 
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @param {Function} onClose - Callback when form is closed
 */
const FeedbackForm = ({ userId, orderId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitFeedback(userId, orderId, rating, message);
      
      if (result.success) {
        toast.success('Thank you for your feedback!');
        onClose();
      } else {
        toast.error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStar = (value) => {
    const isFilled = value <= (hoveredRating || rating);
    return (
      <button
        type="button"
        onClick={() => handleStarClick(value)}
        onMouseEnter={() => handleStarHover(value)}
        onMouseLeave={handleStarLeave}
        className={`transition-all transform hover:scale-110 ${
          isFilled
            ? 'text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
        disabled={submitting}
      >
        <Star
          className={`w-10 h-10 ${
            isFilled ? 'fill-current' : ''
          }`}
        />
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Share Your Feedback
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate your experience? *
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value}>{renderStar(value)}</div>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {rating === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Great! ⭐⭐⭐⭐'}
                {rating === 3 && 'Good ⭐⭐⭐'}
                {rating === 2 && 'Fair ⭐⭐'}
                {rating === 1 && 'Poor ⭐'}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div>
            <label
              htmlFor="feedback-message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Additional Comments (Optional)
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {message.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Your feedback helps us improve our service
        </p>
      </div>
    </div>
  );
};

export default FeedbackForm;

