import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Reviews from "../components/Reviews";
import ReportModal from "../components/ReportModal";
import { Flag } from "lucide-react";

const CONDITION_STYLES = {
  new:        { label: "New",        classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  good:       { label: "Good",       classes: "bg-sky-100 text-sky-700 border-sky-200" },
  acceptable: { label: "Acceptable", classes: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function BookDetail({ isLoggedIn, onLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportUserModal, setShowReportUserModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*, profiles(name, email, college)")
        .eq("id", id)
        .single();

      if (!error && data) {
        // If seller_id is missing, try to resolve it from profiles via email or name
        let resolvedSellerId = data.seller_id;
        if (!resolvedSellerId) {
          // Try matching seller by email first, then by full_name
          if (data.seller_email) {
            const { data: sp } = await supabase.from("profiles").select("id").eq("email", data.seller_email).maybeSingle();
            resolvedSellerId = sp?.id || null;
          }
          if (!resolvedSellerId && data.seller_name) {
            const { data: sp } = await supabase.from("profiles").select("id").eq("full_name", data.seller_name).maybeSingle();
            resolvedSellerId = sp?.id || null;
          }
        }
        setBook({
          ...data,
          seller_id: resolvedSellerId,
          imageUrl: data.image_url || "https://placehold.co/260x380?text=Book",
          listingType: data.price === 0 ? "exchange" : "sell",
          genre: data.genre || data.category || "General",
          available: data.is_available === true,
          seller_name: data.seller_name || data.profiles?.name || "Seller",
          seller_email: data.seller_email || data.profiles?.email,
          seller_college: data.profiles?.college,
        });
      } else {
        // Fallback: fetch without the join in case profiles RLS blocks it
        const { data: bookOnly } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .single();
        if (bookOnly) {
          let resolvedSellerId = bookOnly.seller_id;
          if (!resolvedSellerId) {
            if (bookOnly.seller_email) {
              const { data: sp } = await supabase.from("profiles").select("id").eq("email", bookOnly.seller_email).maybeSingle();
              resolvedSellerId = sp?.id || null;
            }
            if (!resolvedSellerId && bookOnly.seller_name) {
              const { data: sp } = await supabase.from("profiles").select("id").eq("full_name", bookOnly.seller_name).maybeSingle();
              resolvedSellerId = sp?.id || null;
            }
          }
          setBook({
            ...bookOnly,
            seller_id: resolvedSellerId,
            imageUrl: bookOnly.image_url || "https://placehold.co/260x380?text=Book",
            listingType: bookOnly.price === 0 ? "exchange" : "sell",
            genre: bookOnly.genre || bookOnly.category || "General",
            available: bookOnly.is_available === true,
            seller_name: bookOnly.seller_name || "Seller",
          });
        }
      }
      setLoading(false);
    };

    fetchBook();

    // Increment view count for trending calculation
    const incrementView = async () => {
      try {
        await supabase.rpc('increment_book_view', { p_book_id: id });
      } catch (err) {
        console.error("Error incrementing view:", err);
      }
    };
    incrementView();
  }, [id]);

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    getCurrentUser();
  }, []);

  // Re-attempt seller_id resolution after book loads (in case anon RLS blocked it earlier)
  useEffect(() => {
    if (!book || book.seller_id) return; // already resolved or no book
    const resolveSeller = async () => {
      let resolved = null;
      if (book.seller_email) {
        const { data } = await supabase.from("profiles").select("id").eq("email", book.seller_email).maybeSingle();
        resolved = data?.id || null;
      }
      if (!resolved && book.seller_name) {
        const { data } = await supabase.from("profiles").select("id").eq("full_name", book.seller_name).maybeSingle();
        resolved = data?.id || null;
      }
      if (resolved) {
        setBook(prev => ({ ...prev, seller_id: resolved }));
      }
    };
    resolveSeller();
  }, [book?.id, currentUser]); // re-run when currentUser is set (auth session available)

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading book details...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Book not found</h2>
          <p className="text-gray-500 mb-4">This book may have been removed or is pending approval.</p>
          <button onClick={() => navigate("/home")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const conditionStyle = CONDITION_STYLES[book.condition] ?? CONDITION_STYLES.acceptable;

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-base mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pb-16 flex flex-col gap-12">

        {/* ── Cover + Details ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Cover */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[260px] rounded-2xl overflow-hidden shadow-xl border border-blue-100 bg-white">
              <img src={book.imageUrl} alt={book.title} className="w-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/260x380?text=No+Cover"; }} />
            </div>
            <span className={`px-4 py-1.5 rounded-full text-base font-semibold ${book.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {book.available ? "✓ Available Now" : "✗ Not Available"}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider border ${conditionStyle.classes}`}>
                  {conditionStyle.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  {book.genre}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
                  book.listingType === "sell" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
                }`}>
                  {book.listingType === "sell" ? "For Sale" : "For Rent"}
                </span>
              </div>
              <h1 className="text-3xl font-bold leading-snug text-blue-950">{book.title}</h1>
              <p className="text-slate-400 mt-1 text-base">
                by <span className="text-slate-600">{book.author}</span>
              </p>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-blue-950">
              ₹{book.price}
              {book.listingType === "rent" && <span className="text-base font-normal text-slate-400 ml-2">/ semester</span>}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">About this copy</h2>
              <p className="text-slate-600 text-base leading-relaxed">{book.description}</p>
            </div>

            {/* Seller */}
            <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {(book.seller_name || "S")[0]}
                </div>
                <div>
                  <p className="font-semibold text-blue-950 text-base">{book.seller_name || "Seller"}</p>
                  <p className="text-sm text-slate-400">{book.seller_college || "N/A"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportUserModal(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                title="Report this seller">
                <Flag size={13} />
                Report User
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              {!book.available && (
                <div className="w-full py-4 rounded-xl bg-red-50 border border-red-200 text-center mb-1">
                  <p className="text-red-600 font-semibold text-base">❌ Out of Stock</p>
                  <p className="text-red-400 text-sm mt-1">This book is currently unavailable</p>
                </div>
              )}
              {book.available && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/buybook/${book.id}`)}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-base bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
                    {book.price > 0 ? "Buy Now" : "Contact Seller"}
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-3.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
                    title="Report this book">
                    <Flag size={20} />
                  </button>
                </div>
              )}
              {book.available && (
                <button
                  onClick={() => {
                    const bookData = {
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      price: book.price,
                      imageUrl: book.image_url,
                    };
                    if (typeof removeFromCart === 'function') removeFromCart(book.id);
                    if (typeof addToCart === 'function') addToCart(bookData);
                  }}
                  className={`w-full py-3.5 rounded-xl font-semibold text-base border transition-all duration-200 ${
                    cart?.some(c => c.id === book.id)
                      ? "bg-blue-950 text-white border-blue-950"
                      : "border-blue-200 text-blue-700 hover:bg-blue-50"
                  }`}>
                  {cart?.some(c => c.id === book.id) ? "✓ Added to Cart" : "Add to Cart"}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (typeof removeFromWishlist === 'function') removeFromWishlist(book.id);
                    if (typeof addToWishlist === 'function') addToWishlist(book);
                  }}
                  className={`py-3.5 rounded-xl font-semibold text-base border transition-all duration-200 ${
                    wishlist?.some(w => w.id === book.id)
                      ? "border-rose-400 text-rose-500 bg-rose-50"
                      : "border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-400"
                  }`}>
                  {wishlist?.some(w => w.id === book.id) ? "♥ Wishlisted" : "♡ Wishlist"}
                </button>
                <a
                  href={`mailto:${book.seller_email}?subject=Interest in ${book.title}`}
                  className="py-3.5 rounded-xl font-semibold text-base border border-slate-200 text-slate-600
                    hover:border-blue-300 hover:text-blue-600 transition-all duration-200 text-center">
                  💬 Contact Seller
                </a>
              </div>
              {!book.available && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 text-sm transition-all duration-200">
                  <Flag size={14} /> Report this listing
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Seller Contact Info ── */}
        {(book.seller_phone || book.seller_address) && (
          <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400">Seller Contact Information</h2>
            </div>
            <div className="space-y-2 text-base">
              {book.seller_phone && (
                <p className="text-slate-700">
                  <span className="text-slate-400 text-sm block">Phone</span>
                  {book.seller_phone}
                </p>
              )}
              {book.seller_email && (
                <p className="text-slate-700">
                  <span className="text-slate-400 text-sm block">Email</span>
                  {book.seller_email}
                </p>
              )}
              {book.seller_address && (
                <p className="text-slate-700">
                  <span className="text-slate-400 text-sm block">Address</span>
                  {book.seller_address}{book.seller_city && `, ${book.seller_city}`} {book.seller_pincode && `- ${book.seller_pincode}`}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Reviews Section ── */}
        <Reviews bookId={book.id} currentUser={currentUser} />
      </main>

      {/* Report Book Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="book"
        targetId={book.id}
        targetName={book.title}
        currentUser={currentUser}
      />

      {/* Report User/Seller Modal */}
      <ReportModal
        isOpen={showReportUserModal}
        onClose={() => setShowReportUserModal(false)}
        reportType="seller"
        targetId={book.seller_id}
        targetName={book.seller_name || "Seller"}
        currentUser={currentUser}
      />

      <Footer />
    </div>
  );
}