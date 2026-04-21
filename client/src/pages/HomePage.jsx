import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";

export const AUTHORS = [];
export const BOOKS = [];

export function getGenreImage(genreName, size = 200) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(genreName)}&size=${size}&background=dbeafe&color=1d4ed8&bold=true`;
}

export function searchBooks(query, booksToUse = BOOKS, filters = {}) {
  if (!query && !Object.keys(filters).length) return booksToUse;
  const q = query.toLowerCase();
  return booksToUse.filter(b => {
    const textMatch = !query ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.genre?.toLowerCase().includes(q);
    if (!textMatch) return false;
    if (filters.genre && filters.genre !== "All" && b.genre?.toLowerCase() !== filters.genre.toLowerCase()) return false;
    if (filters.condition && filters.condition !== "All" && b.condition?.toLowerCase() !== filters.condition.toLowerCase()) return false;
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

function StarRatingDisplay({ rating, size = "sm" }) {
  const sizeClasses = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  if (!rating || rating === 0) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sizeClasses[size]} ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 dark:fill-gray-600 text-gray-200"}`} viewBox="0 0 20 20">
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
        w-9 h-9 rounded-full shadow-md text-xl leading-none flex items-center justify-center transition-all duration-200
        bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700
        text-blue-600 dark:text-blue-400
        hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white hover:border-blue-600`}>
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

function ProgressBar({ pct = 30 }) {
  return (
    <div className="mt-3 h-0.5 bg-blue-100 dark:bg-gray-700 rounded-full">
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

function GenreStrip({ onGenreClick, sectionRef }) {
  const ref = useRef(null);
  const [dbGenres, setDbGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  useEffect(() => {
    window.refreshGenres = () => setLastFetchTime(Date.now());
    return () => { delete window.refreshGenres; };
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      setGenresLoading(true);
      const { data: genreData, error: genreError } = await supabase
        .from("genres").select("name, image_url").order("name");

      if (!genreError && genreData && genreData.length > 0) {
        setDbGenres(genreData.map(g => ({ name: g.name, img: getGenreImage(g.name, 80) })));
        setGenresLoading(false);
        return;
      }

      const { data: booksData, error: booksError } = await supabase
        .from("books").select("genre")
        .not("genre", "is", null).neq("genre", "")
        .order("created_at", { ascending: false });

      if (!booksError && booksData && booksData.length > 0) {
        const uniqueGenres = [...new Set(booksData.map(b => b.genre).filter(g => g))];
        setDbGenres(uniqueGenres.map(g => ({ name: g, img: getGenreImage(g, 80) })));
      }
      setGenresLoading(false);
    };
    fetchGenres();
  }, [lastFetchTime]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'new-book-added' || e.key === 'book-sold-refresh') setLastFetchTime(Date.now());
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') setLastFetchTime(Date.now());
    };
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => setLastFetchTime(Date.now()), 10000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={sectionRef} className="px-7 mt-10">
      <h2 className="text-center font-serif font-bold text-2xl text-blue-950 dark:text-blue-100 mb-6">Browse by Genre</h2>
      <div className="relative">
        <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide px-2 py-1">
          {genresLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[96px] animate-pulse">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-gray-700" />
                <div className="mt-2 h-3 w-16 bg-blue-100 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : dbGenres.map((g) => (
            <div key={g.name} onClick={() => onGenreClick && onGenreClick(g.name)}
              className="flex flex-col items-center min-w-[96px] cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm">
                <img src={g.img} alt={g.name} className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&size=80&background=dbeafe&color=1d4ed8&bold=true`; }} />
              </div>
              <p className="mt-2 text-center text-sm font-semibold text-blue-900 dark:text-blue-200 leading-tight">{g.name}</p>
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
  const [filters, setFilters] = useState({ genre: "All", condition: "All", priceRange: "All" });
  const availableGenres = [...new Set(booksToUse.map(b => b.genre).filter(g => g))].sort();
  const availableConditions = [...new Set(booksToUse.map(b => b.condition).filter(c => c))].sort();
  const results = searchBooks(query, booksToUse, filters);
  const hasActiveFilters = Object.values(filters).some(v => v !== "All");

  return (
    <div className="px-7 mt-8">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 dark:text-blue-100 mb-4">
        <AccentBar />Search results for "{query}"
        <span className="text-sm font-normal text-slate-400">({results.length} found)</span>
      </h2>
      <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</span>
          {hasActiveFilters && (
            <button onClick={() => setFilters({ genre: "All", condition: "All", priceRange: "All" })}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium ml-auto">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Genre", key: "genre", options: availableGenres, defaultLabel: "All Genres" },
            { label: "Condition", key: "condition", options: availableConditions, defaultLabel: "All Conditions" },
          ].map(({ label, key, options, defaultLabel }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
              <select value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900">
                <option value="All">{defaultLabel}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Price Range</label>
            <select value={filters.priceRange} onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900">
              <option value="All">Any Price</option>
              <option value="Under 100">Under ₹100</option>
              <option value="100-200">₹100 – ₹200</option>
              <option value="200-500">₹200 – ₹500</option>
              <option value="Over 500">Over ₹500</option>
            </select>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">No books found</p>
          <p className="text-sm mt-2">{hasActiveFilters ? "Try adjusting your filters or search term" : "Try a different title, author, or genre"}</p>
          {hasActiveFilters && (
            <button onClick={() => setFilters({ genre: "All", condition: "All", priceRange: "All" })}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">Clear all filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((b) => {
            const rating = bookRatings[b.id];
            return (
              <div key={b.id} onClick={() => onBookClick(b.id)}
                className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm
                  hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                <div className="h-64 overflow-hidden bg-blue-50 dark:bg-gray-700">
                  <img src={b.imageUrl} alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://placehold.co/150x256?text=Book"; }} />
                </div>
                <div className="p-2.5">
                  <p className="font-semibold text-blue-950 dark:text-gray-100 text-xs leading-snug mb-1 line-clamp-2">{b.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 truncate">{b.author}</p>
                  {rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <StarRatingDisplay rating={Math.round(rating.average)} size="sm" />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">({rating.count})</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">₹{b.price}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      b.condition === "Brand New" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                      b.condition === "Like New" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
                      b.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                      "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                    }`}>{b.condition}</span>
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

// ── Trending Now — large card grid slider (top 10 by trending_score) ──────
function TrendingSlider({ data, onBookClick, bookRatings }) {
  const ref = useRef(null);
  const autoScrollRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    if (data.length === 0) return;
    const t = setTimeout(() => {
      autoScrollRef.current = setInterval(() => {
        if (!ref.current || pausedRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll <= 0) return;
        if (scrollLeft >= maxScroll - 2) {
          ref.current.scrollTo({ left: 0 });
        } else {
          ref.current.scrollLeft += 1;
        }
      }, 30);
    }, 300);
    return () => {
      clearTimeout(t);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [data.length]);

  const pauseTemporarily = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, 3000);
  };

  return (
    <div className="px-7 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 dark:text-blue-100">
          <AccentBar />
          🔥 Trending Now
          <span className="text-xs font-normal text-slate-400 dark:text-gray-500 ml-1">
            Top {data.length} by trending score
          </span>
        </h2>
      </div>
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {data.map((book, idx) => (
            <div key={book.id}
              onClick={() => { pauseTemporarily(); onBookClick && onBookClick(book.id); }}
              className="min-w-[200px] max-w-[200px] flex-shrink-0 rounded-xl border overflow-hidden cursor-pointer
                bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700
                shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/30
                transition-all duration-200 group">
              <div className="relative h-64 overflow-hidden bg-blue-50 dark:bg-gray-700">
                <img
                  src={book.img || "https://placehold.co/200x256?text=Book"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = "https://placehold.co/200x256?text=Book"; }}
                />
                {/* Rank badge */}
                <span className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center
                  text-[11px] font-black shadow-md
                  bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                  #{idx + 1}
                </span>
                {/* Trending fire badge */}
                <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white
                  text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  🔥 {book.trending_score > 0 ? Math.round(book.trending_score) : "New"}
                </span>
              </div>
              <div className="p-3">
                <p className="font-semibold text-blue-950 dark:text-gray-100 text-sm leading-snug mb-0.5 line-clamp-2">{book.title}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-2 truncate">{book.author || "Unknown"}</p>
                {bookRatings && bookRatings[book.id] && (
                  <div className="flex items-center gap-1 mb-2">
                    <StarRatingDisplay rating={Math.round(bookRatings[book.id].average)} size="sm" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">({bookRatings[book.id].count})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-blue-700 dark:text-blue-400">₹{book.price}</span>
                  {book.sales_count > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-gray-500">{book.sales_count} sold</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <ArrowBtn side="left" onClick={() => { pauseTemporarily(); ref.current?.scrollBy({ left: -420, behavior: "smooth" }); }} />
        <ArrowBtn side="right" onClick={() => { pauseTemporarily(); ref.current?.scrollBy({ left: 420, behavior: "smooth" }); }} />
      </div>
    </div>
  );
}

function BookRowSlider({ title, data, onBookClick, bookRatings }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 dark:text-blue-100 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {data.map((book, i) => (
          <div key={i} onClick={() => onBookClick && onBookClick(book.id)}
            className="min-w-[280px] max-w-[280px] flex-shrink-0 rounded-xl border p-4 flex gap-4 items-center cursor-pointer
              bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700
              shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/30
              transition-all duration-200">
            <img
              src={book.img || "https://placehold.co/90x128?text=Book"}
              alt={book.title}
              className="w-[90px] h-32 object-cover rounded-lg flex-shrink-0 shadow-md"
              onError={(e) => { e.target.src = "https://placehold.co/90x128/1d4ed8/ffffff?text=Book"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-blue-950 dark:text-gray-100 leading-snug mb-1 line-clamp-2">{book.title}</p>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-1 truncate">{book.author || "Unknown"}</p>
              {bookRatings && bookRatings[book.id] && (
                <div className="flex items-center gap-1 mb-2">
                  <StarRatingDisplay rating={Math.round(bookRatings[book.id].average)} size="sm" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">({bookRatings[book.id].count})</span>
                </div>
              )}
              <span className="text-lg font-bold text-blue-700 dark:text-blue-400">₹{book.price}</span>
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

  useEffect(() => {
    const handleBookRefresh = (e) => {
      if (e.key === 'book-sold-refresh' || e.key === 'new-book-added') setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('storage', handleBookRefresh);
    return () => window.removeEventListener('storage', handleBookRefresh);
  }, []);

  useEffect(() => {
    const fetchConditions = async () => {
      const { data, error } = await supabase.from("books").select("condition")
        .not("condition", "is", null).neq("condition", "");
      if (!error && data) {
        setConditions(STATIC_CONDITIONS.map(cond => ({
          ...cond,
          count: data.filter(b => b.condition === cond.title).length
        })));
      } else {
        setConditions(STATIC_CONDITIONS);
      }
      setLoading(false);
    };
    fetchConditions();
  }, [refreshKey]);

  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 dark:text-blue-100 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[210px] h-48 bg-blue-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))
        ) : conditions.map((item) => (
          <div key={item.title} onClick={() => onConditionClick && onConditionClick(item.title)}
            className="min-w-[210px] max-w-[210px] flex-shrink-0 rounded-xl border overflow-hidden cursor-pointer
              bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700
              shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <img src={item.img} alt={item.title} className="w-full h-32 object-cover"
              onError={(e) => { e.target.src = `https://placehold.co/210x128/1d4ed8/ffffff?text=${encodeURIComponent(item.title)}`; }} />
            <div className="p-3">
              <p className="font-semibold text-base text-blue-950 dark:text-gray-100 mb-2">{item.title}</p>
              <RentBtn label="Browse" />
            </div>
          </div>
        ))}
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
      const { data, error } = await supabase.from("authors").select("*").order("created_at", { ascending: false });
      if (!error && data) setDbAuthors(data);
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
              <div className="w-28 h-28 rounded-full bg-blue-100 dark:bg-gray-700" />
              <div className="mt-3 h-3 w-20 bg-blue-100 dark:bg-gray-700 rounded" />
            </div>
          ))
        ) : dbAuthors.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 px-2">No authors yet</p>
        ) : dbAuthors.map((a) => (
          <div key={a.id} onClick={() => onAuthorClick(a.id)}
            className="flex flex-col items-center min-w-[120px] cursor-pointer group">
            <img src={a.photo_url || a.img} alt={a.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 dark:border-gray-700
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-md"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=112&background=dbeafe&color=1d4ed8&bold=true`; }} />
            <p className="mt-3 text-center text-base font-semibold text-blue-900 dark:text-blue-200 leading-tight">{a.name}</p>
          </div>
        ))}
      </div>
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
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
  const [bookRefreshKey, setBookRefreshKey] = useState(0);

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  useEffect(() => {
    const handleBookRefresh = (e) => {
      if (e.key === 'book-sold-refresh' || e.key === 'new-book-added') setBookRefreshKey(prev => prev + 1);
    };
    window.addEventListener('storage', handleBookRefresh);
    return () => window.removeEventListener('storage', handleBookRefresh);
  }, []);

  // Fetch ratings helper
  const fetchBookRatings = async (bookIds) => {
    if (!bookIds || bookIds.length === 0) return;
    const { data, error } = await supabase
      .from("book_reviews").select("book_id, rating").in("book_id", bookIds);
    if (!error && data) {
      const sums = {}, counts = {};
      data.forEach(r => {
        sums[r.book_id] = (sums[r.book_id] || 0) + r.rating;
        counts[r.book_id] = (counts[r.book_id] || 0) + 1;
      });
      const ratingsMap = {};
      Object.keys(sums).forEach(id => {
        ratingsMap[id] = {
          average: Math.round((sums[id] / counts[id]) * 2) / 2,
          count: counts[id]
        };
      });
      setBookRatings(prev => ({ ...prev, ...ratingsMap }));
    }
  };

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from("books").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setDbBooks(data);
        fetchBookRatings(data.map(b => b.id));
      }
      setLoading(false);
    };
    fetchBooks();
  }, [bookRefreshKey]);

  // Fetch new arrivals (latest 20)
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, price, image_url, cover_url")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        setNewArrivalsQueue(data.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || "Unknown",
          price: b.price || 0,
          img: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book"
        })));
        fetchBookRatings(data.map(b => b.id));
      }
      setNewArrivalsLoading(false);
    };
    fetchNewArrivals();
  }, [bookRefreshKey]);

  // ── Fetch top 10 trending books by trending_score ──────────────────────
  // ── REPLACE the trending useEffect in HomePage.jsx with this ──────────────
// Fetches 50 from book_statistics, filters unavailable, then shows exactly 10

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      setTrendingLoading(true);

      // Step 1: Get top 50 book_ids sorted by trending_score (large pool so
      //         after filtering out unavailable books we still have 10 to show)
      const { data: statsData, error: statsError } = await supabase
        .from("book_statistics")
        .select("book_id, trending_score, sales_count, views_count, avg_rating")
        .order("trending_score", { ascending: false })
        .limit(50);

      if (statsError) {
        console.error("Trending: stats fetch error:", statsError);
      }

      if (statsData && statsData.length > 0) {
        // Step 2: Fetch book details for those IDs
        const bookIds = statsData.map(s => s.book_id);
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("id, title, author, price, image_url, cover_url, is_available, quantity")
          .in("id", bookIds);

        if (!booksError && booksData) {
          const booksMap = {};
          booksData.forEach(b => { booksMap[b.id] = b; });

          // Step 3: Filter unavailable, merge stats, preserve sort order, show exactly 10
          const merged = statsData
            .filter(s => {
              const b = booksMap[s.book_id];
              if (!b) return false;
              if (b.is_available === false) return false;
              if (b.quantity !== null && b.quantity !== undefined && b.quantity <= 0) return false;
              return true;
            })
            .slice(0, 10)  // ← always show exactly 10 available books
            .map(s => {
              const b = booksMap[s.book_id];
              return {
                id: b.id,
                title: b.title,
                author: b.author || "Unknown",
                price: b.price || 0,
                img: b.image_url || b.cover_url || "https://placehold.co/200x256?text=Book",
                trending_score: s.trending_score,
                sales_count: s.sales_count,
                views_count: s.views_count,
                avg_rating: s.avg_rating,
              };
            });

          setTrendingBooks(merged);
          fetchBookRatings(merged.map(b => b.id));

          if (merged.length > 0) {
            setTrendingLoading(false);
            return;
          }
        }
      }

      // ── Fallback: no book_statistics yet → show 10 newest available books ──
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("books")
        .select("id, title, author, price, image_url, cover_url, is_available, quantity")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(30); // fetch more, filter down to 10

      if (!fallbackError && fallbackData) {
        const fallback = fallbackData
          .filter(b =>
            b.is_available !== false &&
            (b.quantity === null || b.quantity === undefined || b.quantity > 0)
          )
          .slice(0, 10) // ← exactly 10
          .map(b => ({
            id: b.id,
            title: b.title,
            author: b.author || "Unknown",
            price: b.price || 0,
            img: b.image_url || b.cover_url || "https://placehold.co/200x256?text=Book",
            trending_score: 0,
            sales_count: 0,
            views_count: 0,
            avg_rating: 0,
          }));
        setTrendingBooks(fallback);
        fetchBookRatings(fallback.map(b => b.id));
      }

      setTrendingLoading(false);
    };

    fetchTrendingBooks();
  }, [bookRefreshKey]);

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

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      {searchQuery ? (
        <div className="pb-20">
          <div className="max-w-6xl mx-auto px-4 pt-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm mb-4 transition-colors">
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
          <Hero onBrowse={() => genreRef.current?.scrollIntoView({ behavior: "smooth" })} />
          <GenreStrip sectionRef={genreRef} onGenreClick={(name) => navigate(`/genre/${encodeURIComponent(name)}`)} />

          <div className="flex justify-center mt-8">
            <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-full p-1 flex gap-1 shadow-sm">
              {["books", "authors"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-8 py-2.5 rounded-full text-base font-semibold transition-all duration-200 ${
                    tab === t
                      ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-200"
                      : "text-slate-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
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
              {/* ── Trending Now (top 10 by trending_score) ── */}
              {trendingLoading ? (
                <div className="px-7 mt-8">
                  <div className="h-6 w-56 bg-blue-100 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="min-w-[200px] h-[340px] bg-blue-100 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
                    ))}
                  </div>
                </div>
              ) : trendingBooks.length > 0 ? (
                <TrendingSlider
                  data={trendingBooks}
                  onBookClick={(id) => navigate(`/books/${id}`)}
                  bookRatings={bookRatings}
                />
              ) : null}

              {/* ── New Arrivals ── */}
              {newArrivalsLoading ? (
                <div className="px-7 mt-8">
                  <div className="h-6 w-40 bg-blue-100 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="min-w-[280px] h-[144px] bg-blue-100 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
                    ))}
                  </div>
                </div>
              ) : newArrivalsQueue.length > 0 ? (
                <BookRowSlider title="New Arrivals" data={newArrivalsQueue} onBookClick={(id) => navigate(`/books/${id}`)} bookRatings={bookRatings} />
              ) : null}

              <ConditionSlider title="Choose Your Book Condition" onConditionClick={(cond) => navigate(`/condition/${encodeURIComponent(cond)}`)} />

              {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">Loading more books…</div>
              ) : dbBooks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg font-medium mb-2">No books available yet</p>
                  <p className="text-sm">Check back later or be the first to sell a book!</p>
                </div>
              ) : (
                <div className="px-7 mt-8">
                  <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 dark:text-blue-100 mb-4">
                    <AccentBar />All Books
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {dbBooks.slice(0, 12).map((b) => {
                      const rating = bookRatings[b.id];
                      return (
                        <div key={b.id} onClick={() => navigate(`/books/${b.id}`)}
                          className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm
                            hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                          <div className="h-64 overflow-hidden bg-blue-50 dark:bg-gray-700">
                            <img
                              src={b.image_url || b.cover_url || "https://placehold.co/150x256?text=Book"}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.src = "https://placehold.co/150x256?text=Book"; }}
                            />
                          </div>
                          <div className="p-2.5">
                            <p className="font-semibold text-blue-950 dark:text-gray-100 text-xs leading-snug mb-1 line-clamp-2">{b.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 truncate">{b.author || "Unknown"}</p>
                            {rating && (
                              <div className="flex items-center gap-1 mb-2">
                                <StarRatingDisplay rating={Math.round(rating.average)} size="sm" />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">({rating.count})</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">₹{b.price || 0}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                b.condition === "Brand New" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                                b.condition === "Like New" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
                                b.condition === "Good Condition" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                                "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                              }`}>{b.condition || "N/A"}</span>
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
