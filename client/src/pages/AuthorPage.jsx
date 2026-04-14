import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import { AUTHORS, BOOKS } from "./HomePage";
import Footer from "./Footer";

export default function AuthorPage({ isLoggedIn, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      const { supabase } = await import("../supabase");

      // Fetch author from database
      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("*")
        .eq("id", id)
        .eq("is_approved", true)
        .single();

      if (!authorError && authorData) {
        setAuthor(authorData);

        // Fetch books by this author — match by author_id (new books) OR author name text (old books)
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("*")
          .or(`author_id.eq.${id},author.ilike.%${authorData.name}%`);

        if (!booksError && booksData) {
          setAuthorBooks(booksData);
        }
      } else {
        // Fallback to hardcoded authors
        const hardcodedAuthor = AUTHORS.find((a) => a.id === id);
        if (hardcodedAuthor) {
          setAuthor(hardcodedAuthor);
        }
      }
      setLoading(false);
    };

    fetchAuthor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 font-sans">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading author...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-blue-50 font-sans">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <p className="text-center text-slate-400 mt-20 text-lg">Author not found.</p>
        </div>
      </div>
    );
  }

  const listedBooks = authorBooks.length > 0 ? authorBooks : (author.books || []);

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-16">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Author Hero */}
        <div className="bg-white border border-blue-100 rounded-2xl p-8 flex gap-8 items-start shadow-sm mb-10">
          <img src={author.photo_url || author.img} alt={author.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md flex-shrink-0"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=128&background=dbeafe&color=1d4ed8&bold=true`;
            }} />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">{author.genre || "Author"}</p>
            <h1 className="text-3xl font-bold text-blue-950 mb-3">{author.name}</h1>
            <p className="text-slate-600 text-base leading-relaxed">{author.description || author.about || "No description available."}</p>
          </div>
        </div>

        {/* Books listed on platform */}
        {listedBooks.length > 0 ? (
          <>
            <h2 className="text-xl font-bold text-blue-950 mb-5">
              Books Available on PowerXchange
              <span className="ml-2 text-sm font-normal text-slate-400">({listedBooks.length} listings)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {listedBooks.map((book) => (
                <div key={book.id} onClick={() => navigate(`/books/${book.id}`)}
                  className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm
                    hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                  <div className="h-48 overflow-hidden bg-blue-50">
                    <img src={book.image_url || book.imageUrl || book.img} alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = "https://placehold.co/200x192?text=Book"; }} />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-blue-950 text-sm leading-snug mb-1">{book.title}</p>
                    <p className="text-xs text-slate-400 mb-2">{book.author || author.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-blue-700">₹{book.price}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        book.condition === "Brand New" ? "bg-green-100 text-green-700" :
                        book.condition === "Like New" ? "bg-blue-100 text-blue-700" :
                        book.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {book.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-blue-100">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-600 font-medium">No books available from this author yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new listings!</p>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}