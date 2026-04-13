import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function CartPage({ isLoggedIn, onLogout, cart = [], wishlist = [], removeFromCart, addToWishlist, removeFromWishlist }) {
  const navigate = useNavigate();

  const total = cart.reduce((sum, book) => sum + (Number(book.price) || 0), 0);

  const handleMoveToWishlist = (book) => {
    if (typeof removeFromCart === "function") removeFromCart(book.id);
    if (typeof addToWishlist === "function") addToWishlist(book);
  };

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
            My Cart
            {cart.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-400">({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
            )}
          </h1>
        </div>

        {cart.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-6xl">🛒</div>
            <h2 className="text-xl font-semibold text-blue-950">Your cart is empty</h2>
            <p className="text-slate-400 text-center max-w-xs">
              Add books from any listing page to start your cart.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart items */}
            <div className="flex-1 flex flex-col gap-3">
              {cart.map((book) => (
                <div
                  key={book.id}
                  className="bg-white border border-blue-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Cover */}
                  <div
                    className="w-16 h-22 rounded-lg overflow-hidden border border-blue-50 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <img
                      src={book.imageUrl || book.image_url || "https://placehold.co/64x96?text=Book"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/64x96?text=Book"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-blue-950 text-base leading-tight cursor-pointer hover:text-blue-600 transition-colors truncate"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-slate-400 mt-0.5">by {book.author}</p>
                    )}
                    <p className="text-lg font-bold text-blue-700 mt-1">
                      {book.price > 0 ? `₹${book.price}` : "Free / Exchange"}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => navigate(`/buybook/${book.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleMoveToWishlist(book)}
                        className="text-sm text-slate-500 hover:text-rose-500 transition-colors font-medium"
                        title="Move to Wishlist"
                      >
                        ♡ Save for later
                      </button>
                      <button
                        onClick={() => removeFromCart && removeFromCart(book.id)}
                        className="text-sm text-slate-400 hover:text-red-500 transition-colors ml-auto"
                        title="Remove from cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-base font-bold text-blue-950 mb-4">Order Summary</h2>

                <div className="flex flex-col gap-2 text-sm text-slate-600 mb-4">
                  {cart.map((book) => (
                    <div key={book.id} className="flex justify-between gap-2">
                      <span className="truncate max-w-[160px]">{book.title}</span>
                      <span className="font-medium text-blue-900 flex-shrink-0">
                        {book.price > 0 ? `₹${book.price}` : "Free"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blue-50 pt-3 mb-5">
                  <div className="flex justify-between font-bold text-blue-950 text-base">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Price of each item is paid directly to the seller.</p>
                </div>

                <button
                  onClick={() => navigate(`/buybook/${cart[0]?.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Proceed to Buy
                </button>

                <button
                  onClick={() => navigate("/home")}
                  className="w-full mt-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all"
                >
                  + Add More Books
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}