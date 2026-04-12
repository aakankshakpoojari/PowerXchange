import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import { GENRES } from "./HomePage";
import Footer from "./Footer";

export default function GenrePage({ isLoggedIn, onLogout, cart, wishlist, addToCart, addToWishlist }) {
  const { name }  = useParams();
  const navigate  = useNavigate();
  const genreName = decodeURIComponent(name);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Try to find genre in hardcoded GENRES for the image
  const genre  = GENRES.find(g => g.name.toLowerCase() === genreName.toLowerCase());
  const genreImage = genre?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(genreName)}&size=96&background=dbeafe&color=1d4ed8&bold=true`;

  useEffect(() => {
    fetchBooks();
  }, [name]);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        authors (
          id,
          name,
          is_approved
        )
      `)
      .eq("is_approved", true)
      .eq("is_available", true)
      .gt("quantity", 0)
      .eq("authors.is_approved", true)
      .ilike("genre", genreName);

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 pb-16">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Genre Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-md flex-shrink-0">
            <img src={genreImage} alt={genreName} className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(genreName)}&size=96&background=dbeafe&color=1d4ed8`; }} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1">Genre</p>
            <h1 className="text-4xl font-bold text-blue-950">{genreName}</h1>
            <p className="text-slate-400 text-base mt-1">
              {books.length > 0 ? `${books.length} book${books.length > 1 ? "s" : ""} available` : "No listings yet"}
            </p>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading books...</div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => (
              <div key={book.id} onClick={() => navigate(`/books/${book.id}`)}
                className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm
                  hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                <div className="h-48 overflow-hidden bg-blue-50">
                  <img src={book.image_url || "https://placehold.co/200x192?text=Book"} alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://placehold.co/200x192?text=Book"; }} />
                </div>
                <div className="p-4">
                  <p className="font-bold text-blue-950 text-base leading-snug mb-1">{book.title}</p>
                  <p className="text-sm text-slate-400 mb-3">{book.author}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-700">₹{book.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      book.condition === "Brand New" ? "bg-green-100 text-green-700" :
                      book.condition === "Like New" ? "bg-blue-100 text-blue-700" :
                      book.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {book.condition}
                    </span>
                  </div>
                  {/* Quick-add buttons */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => addToCart && addToCart(book)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors ${
                        cart?.find(b => b.id === book.id)
                          ? "bg-blue-950 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}>
                      {cart?.find(b => b.id === book.id) ? "✓ Cart" : "+ Cart"}
                    </button>
                    <button
                      onClick={() => addToWishlist && addToWishlist(book)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-semibold border transition-colors ${
                        wishlist?.find(b => b.id === book.id)
                          ? "border-rose-400 text-rose-500 bg-rose-50"
                          : "border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-400"
                      }`}>
                      {wishlist?.find(b => b.id === book.id) ? "♥" : "♡"} Wish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold text-slate-600">No books listed in this genre yet</p>
            <p className="text-base text-slate-400 mt-2">Be the first to list a book in {genreName}!</p>
            <button onClick={() => navigate("/home")}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors">
              Back to Home
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
