import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Eye, EyeOff } from "lucide-react";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      if (onLogin) onLogin();

      // Check if user is an admin by looking at their role in profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setResetEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isLoggedIn={false} />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

          <h1 className="text-2xl font-bold text-indigo-600 mb-2">PowerXchange</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome back!</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        {resetEmailSent && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-2 mb-4">
            Password reset email sent! Check your inbox for instructions to reset your password.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">College Email</label>
            <input
              type="email"
              placeholder="yourname@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading || resetEmailSent}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
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
      <Footer />
    </div>
  );
}

export default Login;