import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import HomePage from "./HomePage";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin();   // ← sets isLoggedIn = true in App.jsx
    navigate("/");  // ← redirects to HomePage.jsx after login
  };

  return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

          <h1 className="text-2xl font-bold text-indigo-600 mb-2">PowerXchange</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome back!</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="text-sm font-medium text-gray-700">College Email</label>
              <input
                type="email"
                placeholder="yourname@college.edu"
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2"
            >
              Sign In
            </button>

          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>

        </div>
      </div>
  );
}

export default Login;