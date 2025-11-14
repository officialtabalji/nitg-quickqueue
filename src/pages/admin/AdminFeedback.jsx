import { useState, useEffect } from 'react';
import { subscribeToFeedback } from '../../firebase/feedback';
import { Star, MessageSquare, Calendar, Hash, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

/**
 * AdminFeedback Page
 * Displays all customer feedback with ratings and comments
 */
const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToFeedback((feedbackData) => {
      setFeedback(feedbackData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter feedback by rating
  const filteredFeedback = filterRating === 'all'
    ? feedback
    : feedback.filter(f => f.rating === parseInt(filterRating));

  // Calculate average rating
  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedback.filter(f => f.rating === rating).length,
    percentage: feedback.length > 0
      ? ((feedback.filter(f => f.rating === rating).length / feedback.length) * 100).toFixed(0)
      : 0
  }));

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Customer Feedback
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and analyze customer ratings and comments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Feedback
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {feedback.length}
              </p>
            </div>
            <MessageSquare className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Average Rating
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {averageRating}
                </p>
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
            </div>
            <Star className="w-12 h-12 text-yellow-400 dark:text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Positive Reviews (4-5⭐)
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {feedback.filter(f => f.rating >= 4).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-2xl">👍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rating Distribution
        </h2>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 w-20">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rating}⭐
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({count})
                </span>
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Rating:
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {filterRating === 'all'
              ? 'No feedback yet. Feedback will appear here once customers submit reviews.'
              : `No ${filterRating}-star feedback found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex-1">
                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(item.rating)}
                  </div>

                  {/* Order ID */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Order: {item.orderId?.slice(0, 8) || 'N/A'}
                    </span>
                  </div>

                  {/* Message */}
                  {item.message && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {item.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {item.createdAt
                      ? formatRelativeTime(item.createdAt)
                      : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;

