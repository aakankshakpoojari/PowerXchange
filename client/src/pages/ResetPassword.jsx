import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have a hash containing the reset token
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      // Supabase automatically handles the session when there's a valid hash
      // User is already authenticated for password reset
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar isLoggedIn={false} />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isLoggedIn={false} />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">PowerXchange</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your new password below</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative mt-1">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-4">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-medium cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;
