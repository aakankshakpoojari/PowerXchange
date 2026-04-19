import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorName from "../components/AuthorName";
import UserBadge from "../components/UserBadge";

export default function BuyBook({ isLoggedIn, onLogout, cart, wishlist, removeFromCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState("");
  const [exchangeBook, setExchangeBook] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // First, fetch the book details
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (bookError || !bookData) {
        console.error("Error fetching book:", bookError);
        setLoading(false);
        return;
      }

      // Then fetch seller profile information
      let sellerInfo = {};
      if (bookData.seller_id) {
        try {
          const { data: sellerProfile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, email, college, phone")
            .eq("id", bookData.seller_id)
            .single();

          if (!profileError && sellerProfile) {
            sellerInfo = {
              seller_name: sellerProfile.full_name || "Seller",
              seller_email: sellerProfile.email,
              seller_college: sellerProfile.college,
              seller_phone: sellerProfile.phone,
            };
          } else {
            sellerInfo = {
              seller_name: "Seller",
              seller_email: null,
              seller_college: "College info not available",
              seller_phone: null,
            };
          }
        } catch (err) {
          console.error("Error fetching seller profile:", err);
          sellerInfo = {
            seller_name: "Seller",
            seller_email: null,
            seller_college: "College info not available",
            seller_phone: null,
          };
        }
      } else {
        sellerInfo = {
          seller_name: "Seller",
          seller_email: null,
          seller_college: "College info not available",
          seller_phone: null,
        };
      }

      console.log("Book and seller info:", {
        book: bookData,
        seller: sellerInfo
      });

      setBook({
        ...bookData,
        ...sellerInfo
      });
      setLoading(false);
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">Book not found.</p>
          <button onClick={() => navigate("/home")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to proceed");
      navigate("/login");
      return;
    }

    // Re-fetch fresh book data to ensure latest availability status
    const { data: freshBookData, error: freshError } = await supabase
      .from("books")
      .select("*")
      .eq("id", book.id)
      .single();

    if (freshError || !freshBookData) {
      alert("Error loading book information. Please try again.");
      return;
    }

    // Block if explicitly marked unavailable or out of stock (using fresh data)
    if (freshBookData.is_available === false || (typeof freshBookData.quantity === 'number' && freshBookData.quantity <= 0)) {
      alert("Sorry, this book is currently out of stock and cannot be purchased.");
      navigate("/home");
      return;
    }

    if (!freshBookData.seller_id) {
      alert("Error: This book does not have a valid seller. Please contact support.");
      return;
    }

    const { error: transactionError } = await supabase.from("transactions").insert({
      book_id: book.id,
      buyer_id: user.id,
      seller_id: freshBookData.seller_id,
      price: freshBookData.price,
      status: "pending",
      notes: mode === "exchange" ? `[EXCHANGE: ${exchangeBook}] ${message}` : message,
    });

    if (transactionError) {
      alert("Error sending request: " + transactionError.message);
      return;
    }

    await supabase
      .from("books")
      .update({ is_available: false })
      .eq("id", book.id);

    try {
      await supabase.rpc("increment_book_sales", { p_book_id: book.id });
    } catch (err) {
      console.error("Error incrementing sales:", err);
    }

    // Send notification to seller
    if (freshBookData.seller_id) {
      try {
        // Fetch buyer name for the notification
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const buyerName = buyerProfile?.full_name || "A buyer";

        await supabase.from("notifications").insert({
          user_id: freshBookData.seller_id,
          type: mode === "exchange" ? "exchange_request" : "purchase_request",
          title: mode === "exchange" ? "New Exchange Request! 📦" : "New Purchase Request! 🛒",
          message: `${buyerName} wants to ${mode === "exchange" ? "exchange" : "buy"} your book "${book.title}". Check your incoming orders for details.`,
          transaction_id: null, // We don't have the transaction id from the insert
        });
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    }

    // Remove book from cart after successful purchase
    if (typeof removeFromCart === 'function') {
      removeFromCart(book.id);
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Out of Stock Warning */}
        {(book.is_available === false || (typeof book.quantity === 'number' && book.quantity <= 0)) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 text-center">
            <p className="text-red-600 font-bold text-base">❌ This book is currently out of stock</p>
            <p className="text-red-500 text-sm mt-1">You cannot place an order for this book at this time.</p>
          </div>
        )}

        {/* Book Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex gap-5 items-start">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-indigo-100 shrink-0">
              {book.image_url ? (
                <img src={book.image_url} alt={book.title} className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-700 text-xs font-medium">
                  {book.genre || "Book"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                <AuthorName authorName={book.author} authorId={book.author_id} />
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {book.condition && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-medium">
                    {book.condition}
                  </span>
                )}
                {book.genre && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 font-medium">
                    {book.genre}
                  </span>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 shrink-0">₹{book.price}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium shrink-0">
            {(book.seller_name || "S")[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              <UserBadge userName={book.seller_name || "Seller"} userId={book.seller_id} />
            </p>
            <p className="text-xs text-gray-500">{book.college || book.seller_college || "College info not available"}</p>
          </div>
        </div>

        {/* Own book warning */}
        {currentUserId && book.seller_id === currentUserId && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center mb-5">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-base font-semibold text-amber-800">This is your own listing</p>
            <p className="text-sm text-amber-600 mt-1">You can't buy or exchange your own book.</p>
            <button
              onClick={() => navigate("/my-books")}
              className="mt-4 text-sm bg-amber-600 text-white rounded-lg px-5 py-2 hover:bg-amber-700 transition font-medium"
            >
              Manage My Books
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!submitted && !(currentUserId && book.seller_id === currentUserId) && (
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setMode(mode === "buy" ? null : "buy")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "buy"
                  ? "bg-indigo-600 text-white"
                  : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              Buy Now
            </button>
            <button
              onClick={() => setMode(mode === "exchange" ? null : "exchange")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "exchange"
                  ? "bg-indigo-600 text-white"
                  : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              Exchange
            </button>
          </div>
        )}

        {/* Buy Form */}
        {mode === "buy" && !submitted && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Send a message to the seller</h2>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in buying this book. Is it still available?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Purchase Request
            </button>
          </div>
        )}

        {/* Exchange Form */}
        {mode === "exchange" && !submitted && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Propose an exchange</h2>
            <input
              type="text"
              value={exchangeBook}
              onChange={(e) => setExchangeBook(e.target.value)}
              placeholder="Book you're offering (title + condition)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 mb-3"
            />
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note to the seller..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || !exchangeBook.trim()}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Exchange Request
            </button>
          </div>
        )}

        {/* Success State */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-base font-semibold text-green-800">Request sent!</p>
            <p className="text-sm text-green-600 mt-1">
              {mode === "buy"
                ? "The seller has been notified and will get back to you soon."
                : "Your exchange proposal has been sent to the seller."}
            </p>
            <div className="flex gap-3 justify-center mt-5">
              <button
                onClick={() => navigate("/orders")}
                className="text-sm bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 transition font-medium"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/home")}
                className="text-sm border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 transition"
              >
                Browse More Books
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}