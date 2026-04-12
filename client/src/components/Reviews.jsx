import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Star, Edit2, Trash2, X, Check } from "lucide-react";

function StarRating({ rating, onRatingChange, interactive = false, size = "md" }) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Reviews({ bookId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch reviews for this book
  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    setLoading(true);

    // Fetch reviews without the join (book_reviews.user_id → auth.users, not profiles)
    const { data, error } = await supabase
      .from("book_reviews")
      .select("*")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
      return;
    }

    // Fetch profile names separately for each unique user
    const reviews = data || [];
    if (reviews.length > 0) {
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, college")
        .in("id", userIds);

      const profileMap = {};
      (profilesData || []).forEach(p => { profileMap[p.id] = p; });

      const enriched = reviews.map(r => ({
        ...r,
        profiles: profileMap[r.user_id] || null,
      }));
      setReviews(enriched);
    } else {
      setReviews([]);
    }

    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!newComment.trim()) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    const { data, error } = await supabase
      .from("book_reviews")
      .upsert(
        {
          book_id: bookId,
          user_id: currentUser.id,
          rating: newRating,
          comment: newComment.trim(),
        },
        { onConflict: "book_id,user_id" }
      )
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      // Sync rating stats for trending score
      await supabase.rpc('sync_book_rating', { p_book_id: bookId });
      setSuccess("Review saved successfully!");
      setNewRating(0);
      setNewComment("");
      setShowForm(false);
      fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleUpdateReview = async () => {
    if (editRating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!editComment.trim()) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error } = await supabase
      .from("book_reviews")
      .update({
        rating: editRating,
        comment: editComment.trim(),
      })
      .eq("id", editingId);

    setSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      // Sync rating stats for trending score
      await supabase.rpc('sync_book_rating', { p_book_id: bookId });
      setSuccess("Review updated successfully!");
      setEditingId(null);
      setEditRating(0);
      setEditComment("");
      fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }

    const { error } = await supabase
      .from("book_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      setError(error.message);
    } else {
      // Sync rating stats for trending score
      await supabase.rpc('sync_book_rating', { p_book_id: bookId });
      setSuccess("Review deleted successfully!");
      fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment("");
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  // Check if current user has already reviewed
  const userReview = reviews.find(r => r.user_id === currentUser?.id);

  return (
    <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-blue-950 mb-6">Customer Reviews</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
          {success}
        </div>
      )}

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl min-w-[150px]">
          <div className="text-5xl font-bold text-blue-950">{averageRating}</div>
          <StarRating rating={Math.round(averageRating)} size="md" />
          <p className="text-sm text-gray-500 mt-2">{reviews.length} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-16">{star} star</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button/Form */}
      {currentUser ? (
        <div className="mb-6">
          {!userReview && !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-md shadow-blue-200"
            >
              Write a Review
            </button>
          ) : !userReview && showForm ? (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Your Review</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                  interactive
                  size="lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewRating(0); setNewComment(""); setError(""); }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 font-semibold hover:underline">Log in</a> to write a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📝</div>
          <p>No reviews yet. Be the first to review this book!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwnReview = review.user_id === currentUser?.id;
            const isEditing = editingId === review.id;

            return (
              <div
                key={review.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors"
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">Edit Your Review</h4>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <StarRating
                      rating={editRating}
                      onRatingChange={setEditRating}
                      interactive
                      size="md"
                    />

                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateReview}
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Check size={16} />
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                          {review.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.profiles?.full_name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.profiles?.college || "College not specified"}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    {isOwnReview && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit review"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}