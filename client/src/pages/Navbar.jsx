import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn, onLogout, cart = [], wishlist = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/browse?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-sm bg-white sticky top-0 z-50">

      {/* Logo */}
      <h1
        onClick={() => navigate(isLoggedIn ? "/home" : "/home")}
        className="text-2xl font-bold cursor-pointer tracking-tight shrink-0"
      >
        <span className="text-blue-600">Power</span>
        <span className="text-blue-950">Xchange</span>
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
              className="w-full pl-9 pr-10 py-2 text-sm rounded-full border border-blue-100
                bg-blue-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                placeholder-blue-300 text-blue-900 transition-all"
            />
            {query && (
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 text-xs font-bold">
                Go
              </button>
            )}
          </form>

          <div className="flex items-center gap-5">
            <span onClick={() => navigate("/home")}
              className="text-sm text-slate-500 font-medium cursor-pointer hover:text-blue-600 transition-colors">
              Home
            </span>
            <button onClick={() => navigate("/sellbook")}
              className="text-sm text-slate-500 font-medium hover:text-blue-600 transition-colors">
              Sell
            </button>

            {/* Cart badge */}
            <button onClick={() => navigate("/profile")}
              className="relative text-slate-500 hover:text-blue-600 transition-colors">
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
            <button onClick={() => navigate("/profile")}
              className="relative text-slate-500 hover:text-rose-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* My Profile */}
            <button onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                Me
              </span>
              My Profile
            </button>

            <button
              onClick={() => { if (onLogout) onLogout(); navigate("/"); }}
              className="text-sm font-medium border border-slate-200 px-4 py-2 rounded-full text-slate-600
                hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200">
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-4">
          <button onClick={() => navigate("/login")}
            className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">
            Login
          </button>
          <button onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-bold
              px-5 py-2 rounded-full shadow-md shadow-blue-200 hover:shadow-blue-300
              hover:scale-105 transition-all duration-200">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
