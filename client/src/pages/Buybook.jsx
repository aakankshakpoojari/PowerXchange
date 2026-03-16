import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function BookDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const book = state?.book;

  const [mode, setMode] = useState(null); // "buy" | "exchange"
  const [message, setMessage] = useState("");
  const [exchangeBook, setExchangeBook] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!book) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="text-center mt-20 text-gray-500">No book selected.</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
            <div className="w-16 h-20 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium shrink-0">
              {book.subject || "Book"}
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
                {book.subject && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 font-medium">
                    {book.subject}
                  </span>
                )}
              </div>
            </div>
            {book.price && (
              <p className="text-2xl font-bold text-gray-900 shrink-0">₹{book.price}</p>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium shrink-0">
            {(typeof book.seller === "object" ? book.seller?.name : book.seller)?.charAt(0) || "S"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{typeof book.seller === "object" ? book.seller?.name : book.seller || "Unknown Seller"}</p>
            <p className="text-xs text-gray-500">NITK Surathkal · Mangaluru, KA</p>
          </div>
          <button className="ml-auto text-sm border border-gray-300 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition">
            View Profile
          </button>
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
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
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
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
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
                ? "The seller will get back to you soon."
                : "Your exchange proposal has been sent to the seller."}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-5 text-sm border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 transition"
            >
              Back to Profile
            </button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}