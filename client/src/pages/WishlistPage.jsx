import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function WishlistPage({ isLoggedIn, onLogout, cart = [], wishlist = [], addToCart, removeFromCart, removeFromWishlist }) {
  const navigate = useNavigate();

  const handleMoveToCart = (book) => {
    if (typeof removeFromWishlist === "function") removeFromWishlist(book.id);
    if (typeof addToCart === "function") addToCart(book);
  };

  const isInCart = (bookId) => cart.some((c) => c.id === bookId);

  return (
    <div className="min-h-screen bg-blue-50 font-sans flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-blue-950">
            My Wishlist
            {wishlist.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-400">
                ({wishlist.length} book{wishlist.length !== 1 ? "s" : ""})
              </span>
            )}
          </h1>
        </div>

        {wishlist.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-6xl">♡</div>
            <h2 className="text-xl font-semibold text-blue-950">Your wishlist is empty</h2>
            <p className="text-slate-400 text-center max-w-xs">
              Save books you love to your wishlist and come back to them anytime.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlist.map((book) => (
              <div
                key={book.id}
                className="bg-white border border-blue-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Cover */}
                <div
                  className="w-16 flex-shrink-0 rounded-lg overflow-hidden border border-blue-50 cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <img
                    src={book.imageUrl || book.image_url || "https://placehold.co/64x96?text=Book"}
                    alt={book.title}
                    className="w-full h-full object-cover min-h-[88px]"
                    onError={(e) => { e.target.src = "https://placehold.co/64x96?text=Book"; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-semibold text-blue-950 text-sm leading-snug cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-slate-400 mt-0.5">by {book.author}</p>
                    )}
                    <p className="text-sm font-bold text-blue-700 mt-1">
                      {book.price > 0 ? `₹${book.price}` : "Free / Exchange"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {isInCart(book.id) ? (
                      <button
                        onClick={() => navigate("/cart")}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition-all"
                      >
                        ✓ In Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMoveToCart(book)}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => removeFromWishlist && removeFromWishlist(book.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue shopping */}
        {wishlist.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/home")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              ← Continue Browsing
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}