import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorName from "../components/AuthorName";

export default function ConditionBooks({ isLoggedIn, onLogout, cart, wishlist }) {
  const { condition } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [condition]);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_available", true)
      .eq("condition", condition)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data);
    } else if (error) {
      console.error("Error fetching condition books:", error);
    }
    setLoading(false);
  }

  const conditionColors = {
    "Brand New": "bg-green-500",
    "Like New": "bg-blue-500",
    "Good Condition": "bg-yellow-500",
    "Old Copies": "bg-orange-500",
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-950 mb-2">{decodeURIComponent(condition)}</h1>
          <p className="text-slate-500">
            {books.length} {books.length === 1 ? "book" : "books"} available in this condition
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg font-medium text-gray-600">No books found in this condition</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="h-48 overflow-hidden bg-blue-50">
                  <img
                    src={book.image_url || "https://placehold.co/200x240?text=Book"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/200x240?text=Book"; }}
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-blue-950 text-sm leading-snug line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <AuthorName authorName={book.author} authorId={book.author_id} />
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-blue-700">₹{book.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${conditionColors[book.condition] || "bg-gray-500"}`}>
                      {book.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}