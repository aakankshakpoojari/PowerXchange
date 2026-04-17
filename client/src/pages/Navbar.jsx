import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ isLoggedIn, onLogout, cart = [], wishlist = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  // Poll for unread notifications
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnread = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch {
        // notifications table might not exist yet, silently ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/browse?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-sm sticky top-0 z-50
    bg-white dark:bg-gray-950
    border-b border-gray-200 dark:border-gray-800
    transition-colors duration-300">

      {/* Logo */}
      <h1
        onClick={() => navigate("/home")}
        className="text-2xl font-bold cursor-pointer tracking-tight shrink-0"
      >
        <span className="text-blue-600 dark:text-blue-400">Power</span>
        <span className="text-blue-950 dark:text-blue-100">Xchange</span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mb-3 ml-0.5" />
      </h1>

      {isLoggedIn ? (
        <>
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm mx-8">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm select-none">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, authors, genres…"
              className="w-full pl-9 pr-10 py-2 text-sm rounded-full
                border border-blue-100 dark:border-gray-700
                bg-blue-50 dark:bg-gray-800
                outline-none focus:border-blue-400 dark:focus:border-blue-500
                focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
                placeholder-blue-300 dark:placeholder-gray-500
                text-blue-900 dark:text-gray-100
                transition-all duration-200"
            />
            {query && (
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold">
                Go
              </button>
            )}
          </form>

          <div className="flex items-center gap-5">
            <span onClick={() => navigate("/home")}
              className="text-sm text-slate-500 dark:text-gray-400 font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </span>
            <button onClick={() => navigate("/sellbook")}
              className="text-sm text-slate-500 dark:text-gray-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sell
            </button>
            <button onClick={() => navigate("/orders")}
              className="text-sm text-slate-500 dark:text-gray-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Orders
            </button>

            {/* Cart badge */}
            <button onClick={() => navigate("/cart")}
              className="relative text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Wishlist badge */}
            <button onClick={() => navigate("/wishlist")}
              className="relative text-slate-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notification bell */}
            <button onClick={() => navigate("/notifications")}
              className="relative text-slate-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600
                border border-slate-200 dark:border-gray-600
                text-slate-600 dark:text-yellow-300
                hover:scale-110 shadow-sm"
            >
              {theme === "dark" ? (
                /* Sun icon — click to switch to light */
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                /* Moon icon — click to switch to dark */
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Profile */}
            <button onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full
                bg-blue-100 dark:bg-blue-900
                flex items-center justify-center
                text-blue-600 dark:text-blue-300
                font-bold text-xs
                border border-blue-200 dark:border-blue-700
                hover:bg-blue-200 dark:hover:bg-blue-800
                transition-colors">
              Me
            </button>

            <button
              onClick={() => { if (onLogout) onLogout(); navigate("/"); }}
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200
                border border-slate-200 dark:border-gray-700
                text-slate-600 dark:text-gray-400
                hover:bg-red-50 dark:hover:bg-red-950
                hover:text-red-500 dark:hover:text-red-400
                hover:border-red-200 dark:hover:border-red-800">
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-4">
          {/* Dark / Light Mode Toggle (logged out) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
              bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600
              border border-slate-200 dark:border-gray-600
              text-slate-600 dark:text-yellow-300
              hover:scale-110 shadow-sm"
          >
            {theme === "dark" ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button onClick={() => navigate("/login")}
            className="text-sm text-slate-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Login
          </button>
          <button onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-bold
              px-5 py-2 rounded-full shadow-md shadow-blue-200 dark:shadow-blue-900
              hover:shadow-blue-300 dark:hover:shadow-blue-800
              hover:scale-105 transition-all duration-200">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
