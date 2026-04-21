import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";

export const AUTHORS = []; // loaded from DB

export const BOOKS = []; // loaded from DB

// Helper function to generate avatar URL with genre initials
export function getGenreImage(genreName, size = 200) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(genreName)}&size=${size}&background=dbeafe&color=1d4ed8&bold=true`;
}


export function searchBooks(query, booksToUse = BOOKS, filters = {}) {
  if (!query && !Object.keys(filters).length) return booksToUse;
  const q = query.toLowerCase();

  return booksToUse.filter(b => {
    // Text search match
    const textMatch = !query ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.genre?.toLowerCase().includes(q);

    if (!textMatch) return false;

    // Apply filters
    if (filters.genre && filters.genre !== "All" && b.genre?.toLowerCase() !== filters.genre.toLowerCase()) {
      return false;
    }
    if (filters.condition && filters.condition !== "All" && b.condition?.toLowerCase() !== filters.condition.toLowerCase()) {
      return false;
    }
    if (filters.priceRange && filters.priceRange !== "All") {
      const price = parseFloat(b.price) || 0;
      if (filters.priceRange === "Under 100" && price >= 100) return false;
      if (filters.priceRange === "100-200" && (price < 100 || price > 200)) return false;
      if (filters.priceRange === "200-500" && (price < 200 || price > 500)) return false;
      if (filters.priceRange === "Over 500" && price <= 500) return false;
    }

    return true;
  });
}

// Helper to render star rating
function StarRatingDisplay({ rating, size = "sm" }) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (!rating || rating === 0) return null;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function AccentBar() {
  return <span className="inline-block w-1 h-5 rounded-sm bg-gradient-to-b from-blue-600 to-cyan-400 flex-shrink-0" />;
}
function ArrowBtn({ side, onClick }) {
  return (
    <button onClick={onClick}
      className={`absolute ${side === "left" ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 z-10
        w-9 h-9 rounded-full bg-white border border-blue-100 shadow-md text-blue-600 text-xl leading-none
        flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200`}>
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
function ProgressBar({ pct = 30 }) {
  return (
    <div className="mt-3 h-0.5 bg-blue-100 rounded-full">
      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}
function RentBtn({ label = "Rent", onClick }) {
  return (
    <button onClick={onClick}
      className="border border-blue-600 text-blue-600 text-xs font-semibold rounded-full px-4 py-1
        hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-400 hover:text-white
        hover:border-transparent transition-all duration-200">
      {label}
    </button>
  );
}

function Hero({ onBrowse }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-400
      flex items-center justify-between px-16 py-20 min-h-[400px]">
      <div className="absolute -top-12 right-44 w-72 h-72 rounded-full bg-cyan-400/10 pointer-events-none" />
      <div className="absolute -bottom-16 left-80 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="max-w-lg z-10">
        <h1 className="font-serif font-black text-5xl text-white leading-tight mb-3">
          Give Your Books<br />
          <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">a Second Life</span>
        </h1>
        <p className="text-white/75 text-lg leading-relaxed mb-7">
          Buy, sell, and rent textbooks with fellow students at your campus.
        </p>
        <button onClick={onBrowse}
          className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold
            px-8 py-3 rounded-xl shadow-[0_6px_22px_rgba(0,198,255,0.4)] hover:scale-105 transition-transform duration-200">
          Browse Books
        </button>
      </div>
      <div className="relative z-10">
        <img src="https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=760&h=560&fit=crop"
          alt="Books" className="w-96 h-72 object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-2 border-white/15"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=760&h=560&fit=crop"; }} />
      </div>
    </section>
  );
}

// ← sectionRef added as prop
function GenreStrip({ onGenreClick, sectionRef }) {
  const ref = useRef(null);
  const [dbGenres, setDbGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  // Expose refresh function to window for manual triggering
  useEffect(() => {
    window.refreshGenres = () => {
      console.log("Manual genre refresh triggered");
      setLastFetchTime(Date.now());
    };
    return () => { delete window.refreshGenres; };
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      setGenresLoading(true);
      const { supabase } = await import("../supabase");

      console.log("HomePage: Fetching genres...");

      // First, try to fetch from genres table
      const { data: genreData, error: genreError } = await supabase
        .from("genres")
        .select("name, image_url")
        .order("name");

      console.log("HomePage: Genres table result:", { genreData, genreError });

      if (!genreError && genreData && genreData.length > 0) {
        console.log("HomePage: Got genres from genres table:", genreData);
        // Always use avatar with initials for consistent look
        setDbGenres(genreData.map(g => ({
          name: g.name,
          img: getGenreImage(g.name, 80)
        })));
        setGenresLoading(false);
        return;
      }

      console.log("HomePage: Genres table empty or error, fetching from books...");

      // Fallback: get unique genres from ALL books (not just approved)
      // This ensures new genres appear immediately
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("genre")
        .not("genre", "is", null)
        .neq("genre", "")
        .order("created_at", { ascending: false });

      console.log("HomePage: Books genre result:", { booksData, booksError });

      if (booksError) {
        console.error("HomePage: Error fetching genres from books:", booksError);
      }

      if (!booksError && booksData && booksData.length > 0) {
        console.log("HomePage: Got genres from books:", booksData);
        const uniqueGenres = [...new Set(booksData.map(b => b.genre).filter(g => g))];
        console.log("HomePage: Unique genres:", uniqueGenres);
        setDbGenres(uniqueGenres.map(g => ({
          name: g,
          img: getGenreImage(g, 80)
        })));
      } else {
        console.log("HomePage: No genres found in books either");
      }
      setGenresLoading(false);
    };

    fetchGenres();
  }, [lastFetchTime]);

  // Listen for storage events (when another tab/page adds a new genre or book is sold)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'new-book-added' || e.key === 'book-sold-refresh') {
        console.log("HomePage: Book event detected (storage event), refreshing genres...", e.key);
        setLastFetchTime(Date.now());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also refresh on visibility change (when user switches back to this tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("HomePage: Tab became visible, refreshing genres...");
        setLastFetchTime(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll for new genres every 10 seconds
    const interval = setInterval(() => {
      console.log("HomePage: Polling for new genres...");
      setLastFetchTime(Date.now());
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Only show real genres from DB — no dummy fallback
  const genresToShow = dbGenres;

  return (
    <div ref={sectionRef} className="px-7 mt-10">
      <h2 className="text-center font-serif font-bold text-2xl text-blue-950 mb-6">Browse by Genre</h2>
      <div className="relative">
        <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide px-2 py-1">
          {genresLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[96px] animate-pulse">
                <div className="w-20 h-20 rounded-2xl bg-blue-100" />
                <div className="mt-2 h-3 w-16 bg-blue-100 rounded" />
              </div>
            ))
          ) : genresToShow.map((g) => (
            <div key={g.name} onClick={() => onGenreClick && onGenreClick(g.name)}
              className="flex flex-col items-center min-w-[96px] cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-100 bg-blue-50
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm">
                <img src={g.img} alt={g.name} className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&size=80&background=dbeafe&color=1d4ed8&bold=true`;
                  }} />
              </div>
              <p className="mt-2 text-center text-sm font-semibold text-blue-900 leading-tight">{g.name}</p>
            </div>
          ))}
        </div>
        <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
        <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
      </div>
    </div>
  );
}

function SearchResults({ query, onBookClick, booksToUse, bookRatings }) {
  const [filters, setFilters] = useState({
    genre: "All",
    condition: "All",
    priceRange: "All"
  });

  // Get unique genres from books for filter dropdown
  const availableGenres = [...new Set(booksToUse.map(b => b.genre).filter(g => g))].sort();
  const availableConditions = [...new Set(booksToUse.map(b => b.condition).filter(c => c))].sort();

  const results = searchBooks(query, booksToUse, filters);

  const hasActiveFilters = Object.values(filters).some(v => v !== "All");

  return (
    <div className="px-7 mt-8">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />Search results for "{query}"
        <span className="text-sm font-normal text-slate-400">({results.length} found)</span>
      </h2>

      {/* Filters */}
      <div className="bg-white border border-blue-100 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ genre: "All", condition: "All", priceRange: "All" })}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Genre Filter */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Genres</option>
              {availableGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Conditions</option>
              {availableConditions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Price Range</label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">Any Price</option>
              <option value="Under 100">Under ₹100</option>
              <option value="100-200">₹100 - ₹200</option>
              <option value="200-500">₹200 - ₹500</option>
              <option value="Over 500">Over ₹500</option>
            </select>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">No books found</p>
          <p className="text-sm mt-2">
            {hasActiveFilters
              ? "Try adjusting your filters or search term"
              : "Try a different title, author, or genre"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ genre: "All", condition: "All", priceRange: "All" })}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((b) => {
            const rating = bookRatings[b.id];
            return (
              <div key={b.id} onClick={() => onBookClick(b.id)}
                className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm
                  hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                <div className="h-64 overflow-hidden bg-blue-50">
                  <img src={b.imageUrl} alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://placehold.co/150x256?text=Book"; }} />
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-blue-950 text-xs leading-snug mb-1 line-clamp-2">{b.title}</p>
                  <p className="text-[10px] text-slate-400 mb-2 truncate">{b.author}</p>
                  {rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <StarRatingDisplay rating={Math.round(rating.average)} size="sm" />
                      <span className="text-[10px] text-gray-500">({rating.count})</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700">₹{b.price}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      b.condition === "Brand New" ? "bg-green-100 text-green-700" :
                      b.condition === "Like New" ? "bg-blue-100 text-blue-700" :
                      b.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {b.condition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookGridSlider({ title, data, onBookClick, bookRatings }) {
  const ref = useRef(null);
  const autoScrollRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const startAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!ref.current || pausedRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const maxScroll = scrollWidth - clientWidth;
      // Only auto-scroll if content is actually wider than the container
      if (maxScroll <= 0) return;
      if (scrollLeft >= maxScroll - 2) {
        ref.current.scrollTo({ left: 0 });
      } else {
        ref.current.scrollLeft += 1;
      }
    }, 30);
  };

  // Start auto-scroll only after data is loaded (data.length in deps)
  useEffect(() => {
    if (data.length === 0) return;
    // Small delay so DOM has painted the cards before we measure scrollWidth
    const t = setTimeout(startAutoScroll, 300);
    return () => {
      clearTimeout(t);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [data.length]);

  const pauseTemporarily = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 3000); // resume auto-scroll 3s after last interaction
  };

  const handleScrollLeft = () => {
    pauseTemporarily();
    ref.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    pauseTemporarily();
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const maxScroll = scrollWidth - clientWidth;
    if (scrollLeft >= maxScroll - 2) {
      ref.current.scrollTo({ left: 0 });
    } else {
      ref.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {data.map((book) => (
          <div key={book.id} onClick={() => onBookClick && onBookClick(book.id)}
            className="min-w-[220px] max-w-[220px] flex-shrink-0 bg-white rounded-xl border border-blue-100
              shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="relative h-72 overflow-hidden bg-blue-50">
              <img src={book.img} alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/220x288?text=Book"; }} />
              <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white
                text-[10px] font-bold px-2 py-0.5 rounded-full shadow">🔥 Trending</span>
            </div>
            <div className="p-3">
              <p className="font-semibold text-blue-950 text-base leading-snug mb-1 line-clamp-2">{book.title}</p>
              <p className="text-sm text-slate-500 mb-2 truncate">{book.author || "Unknown"}</p>
              {bookRatings && bookRatings[book.id] && (
                <div className="flex items-center gap-1 mb-2">
                  <StarRatingDisplay rating={Math.round(bookRatings[book.id].average)} size="sm" />
                  <span className="text-[10px] text-gray-500">({bookRatings[book.id].count})</span>
                </div>
              )}
              <span className="text-lg font-bold text-blue-700">₹{book.price}</span>
            </div>
          </div>
        ))}
      </div>
      <ArrowBtn side="left"  onClick={handleScrollLeft} />
      <ArrowBtn side="right" onClick={handleScrollRight} />
    </div>
  );
}

function BookRowSlider({ title, data, onBookClick, bookRatings }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {data.map((book, i) => (
          <div key={i} onClick={() => onBookClick && onBookClick(book.id)}
            className="min-w-[280px] max-w-[280px] flex-shrink-0 bg-white rounded-xl border border-blue-100
              shadow-sm p-4 flex gap-4 items-center hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100
              transition-all duration-200 cursor-pointer">
            <img src={book.img} alt={book.title}
              className="w-[90px] h-32 object-cover rounded-lg flex-shrink-0 shadow-md"
              onError={(e) => { e.target.src = "https://placehold.co/90x128/1d4ed8/ffffff?text=Book"; }} />
            <div className="flex-1">
              <p className="font-semibold text-base text-blue-950 leading-snug mb-1">{book.title}</p>
              <p className="text-sm text-slate-500 mb-1">{book.author || "Unknown"}</p>
              {bookRatings && bookRatings[book.id] && (
                <div className="flex items-center gap-1 mb-2">
                  <StarRatingDisplay rating={Math.round(bookRatings[book.id].average)} size="sm" />
                  <span className="text-[10px] text-gray-500">({bookRatings[book.id].count})</span>
                </div>
              )}
              <span className="text-lg font-bold text-blue-700">₹{book.price}</span>
            </div>
          </div>
        ))}
      </div>
      <ProgressBar pct={30} />
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -420, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  420, behavior: "smooth" })} />
    </div>
  );
}

function ConditionSlider({ title, onConditionClick }) {
  const ref = useRef(null);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const STATIC_CONDITIONS = [
    { title: "Brand New",      img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=220&fit=crop" },
    { title: "Like New",       img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=220&fit=crop" },
    { title: "Good Condition", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=220&fit=crop" },
    { title: "Old Copies",     img: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=220&fit=crop" },
  ];

  // Listen for book-sold-refresh events
  useEffect(() => {
    const handleBookRefresh = (e) => {
      if (e.key === 'book-sold-refresh' || e.key === 'new-book-added') {
        console.log("ConditionSlider: Refreshing conditions...");
        setRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleBookRefresh);
    return () => window.removeEventListener('storage', handleBookRefresh);
  }, []);

  useEffect(() => {
    const fetchConditions = async () => {
      const { supabase } = await import("../supabase");

      // Get all unique conditions from available books
      const { data, error } = await supabase
        .from("books")
        .select("condition")
        .eq("is_approved", true)
        .eq("is_available", true)
        .not("condition", "is", null)
        .neq("condition", "");

      if (!error && data) {
        const uniqueConditions = [...new Set(data.map(b => b.condition))];
        // Map to static condition data for images
        const conditionsWithImages = uniqueConditions
          .map(cond => STATIC_CONDITIONS.find(c => c.title === cond) || { title: cond, img: `https://placehold.co/210x128?text=${encodeURIComponent(cond)}` })
          .sort((a, b) => STATIC_CONDITIONS.findIndex(c => c.title === a.title) - STATIC_CONDITIONS.findIndex(c => c.title === b.title));

        setConditions(conditionsWithImages);
      }
      setLoading(false);
    };

    fetchConditions();
  }, [refreshKey]);

  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[210px] h-48 bg-blue-100 rounded-xl animate-pulse" />
          ))
        ) : conditions.length > 0 ? (
          conditions.map((item) => (
            <div key={item.title}
              onClick={() => onConditionClick && onConditionClick(item.title)}
              className="min-w-[210px] max-w-[210px] flex-shrink-0 bg-white rounded-xl border border-blue-100
                overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
              <img src={item.img} alt={item.title} className="w-full h-32 object-cover"
                onError={(e) => { e.target.src = `https://placehold.co/210x128/1d4ed8/ffffff?text=${encodeURIComponent(item.title)}`; }} />
              <div className="p-3">
                <p className="font-semibold text-base text-blue-950 mb-2">{item.title}</p>
                <RentBtn label="Browse" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm py-4 px-2">No conditions available yet</p>
        )}
      </div>
      <ProgressBar pct={100} />
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -400, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  400, behavior: "smooth" })} />
    </div>
  );
}

function AuthorSlider({ onAuthorClick }) {
  const ref = useRef(null);
  const [dbAuthors, setDbAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbAuthors(data);
      }
      setAuthorsLoading(false);
    };

    fetchAuthors();
  }, []);

  return (
    <div className="px-7 mt-6 relative">
      <div ref={ref} className="flex gap-8 overflow-x-auto scrollbar-hide py-2">
        {authorsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center min-w-[120px] animate-pulse">
              <div className="w-28 h-28 rounded-full bg-blue-100" />
              <div className="mt-3 h-3 w-20 bg-blue-100 rounded" />
            </div>
          ))
        ) : dbAuthors.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 px-2">No authors yet</p>
        ) : dbAuthors.map((a) => (
          <div key={a.id} onClick={() => onAuthorClick(a.id)}
            className="flex flex-col items-center min-w-[120px] cursor-pointer group">
            <img src={a.photo_url || a.img} alt={a.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-md"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=112&background=dbeafe&color=1d4ed8&bold=true`; }} />
            <p className="mt-3 text-center text-base font-semibold text-blue-900 leading-tight">{a.name}</p>
          </div>
        ))}
      </div>
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
    </div>
  );
}

export default function HomePage({ isLoggedIn, isAdmin, onLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [tab, setTab] = useState("books");
  const genreRef  = useRef(null);
  const [dbBooks, setDbBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArrivalsQueue, setNewArrivalsQueue] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [bookRatings, setBookRatings] = useState({});

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  // Track book refreshes for when books are sold/added
  const [bookRefreshKey, setBookRefreshKey] = useState(0);

  // Listen for book-sold-refresh events to update the books list
  useEffect(() => {
    const handleBookRefresh = (e) => {
      if (e.key === 'book-sold-refresh' || e.key === 'new-book-added') {
        console.log("HomePage: Book refresh event detected, updating books list");
        setBookRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleBookRefresh);
    return () => window.removeEventListener('storage', handleBookRefresh);
  }, []);

  // Fetch all books for general display
  useEffect(() => {
    const fetchBooks = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        console.log("HomePage: Fetched books:", data.length);
        setDbBooks(data);
        // Fetch ratings for these books
        fetchBookRatings(data.map(b => b.id));
      } else {
        console.error("HomePage: Error fetching books:", error);
      }
      setLoading(false);
    };

    fetchBooks();
  }, [bookRefreshKey]);

  // Fetch average ratings for books
  const fetchBookRatings = async (bookIds) => {
    if (!bookIds || bookIds.length === 0) return;

    const { supabase } = await import("../supabase");
    const { data, error } = await supabase
      .from("book_reviews")
      .select("book_id, rating")
      .in("book_id", bookIds);

    console.log("HomePage: Fetched reviews for", bookIds.length, "books:", { data, error });

    if (!error && data) {
      // Calculate average rating per book
      const ratingsMap = {};
      const sums = {};
      const counts = {};

      data.forEach(r => {
        if (!sums[r.book_id]) {
          sums[r.book_id] = 0;
          counts[r.book_id] = 0;
        }
        sums[r.book_id] += r.rating;
        counts[r.book_id] += 1;
      });

      Object.keys(sums).forEach(bookId => {
        ratingsMap[bookId] = {
          average: Math.round((sums[bookId] / counts[bookId]) * 2) / 2, // Round to nearest 0.5
          count: counts[bookId]
        };
      });

      console.log("HomePage: Calculated ratings:", ratingsMap);
      setBookRatings(prev => ({ ...prev, ...ratingsMap }));
    } else if (error) {
      console.error("HomePage: Error fetching ratings:", error);
    }
  };

  // Fetch new arrivals queue: latest 20 books by date added
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, price, image_url, cover_url")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        console.log("HomePage: Fetched new arrivals:", data.length);
        const queue = data.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || "Unknown",
          price: b.price || 0,
          img: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book"
        }));
        setNewArrivalsQueue(queue);
        fetchBookRatings(data.map(b => b.id));
      } else {
        console.error("HomePage: Error fetching new arrivals:", error);
      }
      setNewArrivalsLoading(false);
    };

    fetchNewArrivals();
  }, [bookRefreshKey]);

  // Fetch trending books: top 10 by sales, views, ratings (with fallback)
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      const { supabase } = await import("../supabase");

      // Try to get books joined via book_statistics
      const { data: statsData, error: statsError } = await supabase
        .from("book_statistics")
        .select(`
          book_id,
          trending_score,
          views_count,
          sales_count
        `)
        .order("trending_score", { ascending: false })
        .limit(30);

      if (!statsError && statsData && statsData.length > 0) {
        // Fetch the actual book details for these IDs
        const bookIds = statsData.map(s => s.book_id);
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("id, title, author, price, image_url, cover_url, quantity, is_available")
          .in("id", bookIds);

        if (!booksError && booksData && booksData.length > 0) {
          // Merge stats with book data, filter out unavailable/out-of-stock
          const bookMap = Object.fromEntries(booksData.map(b => [b.id, b]));
          const trending = statsData
            .map(s => ({ ...s, book: bookMap[s.book_id] }))
            .filter(s => s.book && s.book.is_available !== false && (s.book.quantity == null || s.book.quantity > 0))
            .slice(0, 10)
            .map(s => ({
              id: s.book.id,
              title: s.book.title,
              author: s.book.author || "Unknown",
              price: s.book.price || 0,
              img: s.book.image_url || s.book.cover_url || "https://placehold.co/220x288?text=Book",
              trendingScore: s.trending_score
            }));

          if (trending.length > 0) {
            setTrendingBooks(trending);
            fetchBookRatings(bookIds);
            setTrendingLoading(false);
            return;
          }
        }
      }

      // Fallback: most recently added available books
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("books")
        .select("id, title, author, price, image_url, cover_url")
        .neq("is_available", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!fallbackError && fallbackData) {
        const fallback = fallbackData.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || "Unknown",
          price: b.price || 0,
          img: b.image_url || b.cover_url || "https://placehold.co/220x288?text=Book"
        }));
        setTrendingBooks(fallback);
        fetchBookRatings(fallbackData.map(b => b.id));
      }
      setTrendingLoading(false);
    };

    fetchTrendingBooks();
  }, [bookRefreshKey]);

  // Use database books if available
  const booksToUse = dbBooks.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author || "Unknown",
    price: b.price || 0,
    listingType: b.price === 0 ? "exchange" : "sell",
    condition: b.condition || "good",
    genre: b.category || b.genre || "General",
    description: b.description || "",
    imageUrl: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book",
    available: b.is_available !== false,
    seller: { name: b.seller_name || "Unknown", college: "N/A" },
  }));

  // trending is now fetched from database based on sales, views, ratings
  // falls back to recently added books if no statistics exist

  console.log("HomePage render:", { loading, dbBooks: dbBooks.length, trendingBooks: trendingBooks.length, newArrivalsQueue: newArrivalsQueue.length, bookRatings });

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      {searchQuery ? (
        <div className="pb-20">
          <div className="max-w-6xl mx-auto px-4 pt-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          <SearchResults query={searchQuery} onBookClick={(id) => navigate(`/books/${id}`)} booksToUse={booksToUse} bookRatings={bookRatings} />
        </div>
      ) : (
        <>
          {/* ← onBrowse now scrolls to genreRef */}
          <Hero onBrowse={() => genreRef.current?.scrollIntoView({ behavior: "smooth" })} />

          {/* ← sectionRef passed in */}
          <GenreStrip
            sectionRef={genreRef}
            onGenreClick={(name) => navigate(`/genre/${encodeURIComponent(name)}`)}
          />

          <div className="flex justify-center mt-8">
            <div className="bg-white border border-blue-100 rounded-full p-1 flex gap-1 shadow-sm">
              {["books", "authors"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-8 py-2.5 rounded-full text-base font-semibold transition-all duration-200 ${
                    tab === t
                      ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-200"
                      : "text-slate-400 hover:text-blue-600"
                  }`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {tab === "authors" ? (
            <AuthorSlider onAuthorClick={(id) => navigate(`/author/${id}`)} />
          ) : (
            <>
              {/* Trending Now */}
              {trendingLoading ? (
                <div className="px-7 mt-8">
                  <div className="h-6 w-40 bg-blue-100 rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="min-w-[220px] h-[340px] bg-blue-100 rounded-xl animate-pulse flex-shrink-0" />
                    ))}
                  </div>
                </div>
              ) : trendingBooks.length > 0 ? (
                <BookGridSlider title="Trending Now" data={trendingBooks} onBookClick={(id) => navigate(`/books/${id}`)} bookRatings={bookRatings} />
              ) : null}

              {/* New Arrivals */}
              {newArrivalsLoading ? (
                <div className="px-7 mt-8">
                  <div className="h-6 w-40 bg-blue-100 rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="min-w-[280px] h-[144px] bg-blue-100 rounded-xl animate-pulse flex-shrink-0" />
                    ))}
                  </div>
                </div>
              ) : newArrivalsQueue.length > 0 ? (
                <BookRowSlider title="New Arrivals" data={newArrivalsQueue} onBookClick={(id) => navigate(`/books/${id}`)} bookRatings={bookRatings} />
              ) : null}

              {/* Condition Slider — always shown */}
              <ConditionSlider title="Choose Your Book Condition" onConditionClick={(cond) => navigate(`/condition/${encodeURIComponent(cond)}`)} />

              {/* Show a friendly message if DB is still loading the main books */}
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">Loading more books…</div>
              ) : dbBooks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg font-medium mb-2">No books available yet</p>
                  <p className="text-sm">Check back later or be the first to sell a book!</p>
                </div>
              ) : (
                <div className="px-7 mt-8">
                  <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
                    <AccentBar />All Books
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {dbBooks.slice(0, 12).map((b) => {
                      const rating = bookRatings[b.id];
                      return (
                        <div key={b.id} onClick={() => navigate(`/books/${b.id}`)}
                          className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm
                            hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                          <div className="h-64 overflow-hidden bg-blue-50">
                            <img src={b.image_url || b.cover_url} alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.src = "https://placehold.co/150x256?text=Book"; }} />
                          </div>
                          <div className="p-2.5">
                            <p className="font-semibold text-blue-950 text-xs leading-snug mb-1 line-clamp-2">{b.title}</p>
                            <p className="text-[10px] text-slate-400 mb-2 truncate">{b.author || "Unknown"}</p>
                            {rating && (
                              <div className="flex items-center gap-1 mb-2">
                                <StarRatingDisplay rating={Math.round(rating.average)} size="sm" />
                                <span className="text-[10px] text-gray-500">({rating.count})</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-blue-700">₹{b.price || 0}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                b.condition === "Brand New" ? "bg-green-100 text-green-700" :
                                b.condition === "Like New" ? "bg-blue-100 text-blue-700" :
                                b.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700" :
                                "bg-orange-100 text-orange-700"
                              }`}>
                                {b.condition || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <Footer />
        </>
      )}
    </div>
  );
}