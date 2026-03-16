import { useNavigate } from "react-router-dom";

export default function Navbar({ isProfile }) {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-sm bg-white sticky top-0 z-50">

      {/* Logo */}
      <h1
        onClick={() => navigate("/home")}
        className="text-2xl font-bold cursor-pointer tracking-tight"
      >
        <span className="text-blue-600">Power</span>
        <span className="text-blue-950">Xchange</span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mb-3 ml-0.5" />
      </h1>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mx-8">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm select-none">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search books, authors, genres…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-blue-100
            bg-blue-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            placeholder-blue-300 text-blue-900 transition-all"
        />
      </div>

      {/* Nav links + actions */}
      <div className="flex items-center gap-5">
        {["Home", "Browse"].map((link) => (
          <span
            key={link}
            onClick={() => navigate(link === "Home" ? "/" : `/${link.toLowerCase()}`)}
            className="text-sm text-slate-500 font-medium cursor-pointer hover:text-blue-600 transition-colors"
          >
            {link}
          </span>
        ))}

        <button
          onClick={() => navigate("/login")}
          className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-bold
            px-5 py-2 rounded-full shadow-md shadow-blue-200 hover:shadow-blue-300
            hover:scale-105 transition-all duration-200"
        >
          Sign Up
        </button>

        {isProfile && (
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-sm text-slate-600 font-medium
              hover:text-blue-600 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
              text-blue-600 font-bold text-xs border border-blue-200">
              Me
            </span>
            My Profile
          </button>
        )}
      </div>
    </nav>
  );
}