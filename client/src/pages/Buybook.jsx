import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function BuyBook({ isLoggedIn, onLogout, cart, wishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState("");
  const [exchangeBook, setExchangeBook] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      // First try with profiles join
      const { data, error } = await supabase
        .from("books")
        .select("*, profiles(name, full_name, email, college)")
        .eq("id", id)
        .single();

      if (!error && data) {
        const profile = data.profiles || {};
        setBook({
          ...data,
          seller_name: data.seller_name || profile.name || profile.full_name || "Seller",
          seller_email: data.seller_email || profile.email,
          seller_college: data.seller_college || profile.college,
          seller_phone: data.seller_phone,
          seller_address: data.seller_address,
          seller_city: data.seller_city,
          seller_pincode: data.seller_pincode,
        });
      } else {
        // Fallback: fetch without join in case profiles RLS blocks it
        const { data: bookOnly } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .single();

        if (bookOnly) {
          setBook({
            ...bookOnly,
            seller_name: bookOnly.seller_name || "Seller",
          });
        }
      }
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

    // Only block if explicitly marked unavailable; treat null/undefined quantity as 1
    if (book.is_available === false) {
      alert("Sorry, this book is currently out of stock.");
      navigate("/home");
      return;
    }

    const newQuantity = Math.max(0, (book.quantity ?? 1) - 1);

    const { error: transactionError } = await supabase.from("transactions").insert({
      book_id: book.id,
      buyer_id: user.id,
      seller_id: book.seller_id,
      price: book.price,
      status: "pending",
      notes: mode === "exchange" ? `[EXCHANGE: ${exchangeBook}] ${message}` : message,
    });

    if (transactionError) {
      alert("Error sending request: " + transactionError.message);
      return;
    }

    await supabase
      .from("books")
      .update({ quantity: newQuantity })
      .eq("id", book.id);

    try {
      await supabase.rpc("increment_book_sales", { p_book_id: book.id });
    } catch (err) {
      console.error("Error incrementing sales:", err);
    }

    // Send notification to seller
    if (book.seller_id) {
      try {
        // Fetch buyer name for the notification
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("full_name, name")
          .eq("id", user.id)
          .single();
        const buyerName = buyerProfile?.full_name || buyerProfile?.name || "A buyer";

        await supabase.from("notifications").insert({
          user_id: book.seller_id,
          type: mode === "exchange" ? "exchange_request" : "purchase_request",
          title: mode === "exchange" ? "New Exchange Request! 📦" : "New Purchase Request! 🛒",
          message: `${buyerName} wants to ${mode === "exchange" ? "exchange" : "buy"} your book "${book.title}". Check your incoming orders for details.`,
          transaction_id: null, // We don't have the transaction id from the insert
        });
      } catch (err) {
        console.error("Error sending notification:", err);
      }
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
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
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
            <p className="text-sm font-medium text-gray-900">{book.seller_name || "Seller"}</p>
            <p className="text-xs text-gray-500">{book.seller_college || "College info not available"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!submitted && (
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