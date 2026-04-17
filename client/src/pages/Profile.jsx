import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Package, ShoppingBag, CheckCircle, Clock, Heart, BookOpen, ShoppingCart } from "lucide-react";


export default function Profile({ isLoggedIn, onLogout, cart }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    listed: 0,
    sold: 0,
    purchases: 0,
    wishlist: 0,
    totalEarnings: 0,
    totalSpent: 0,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
  });
  const [draft, setDraft] = useState(form);
  const [userId, setUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile and data from database
  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      setUserId(user.id);

      // Fetch profile from database
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const userData = {
          name: profileData.full_name || user.user_metadata?.full_name || "User",
          email: profileData.email || user.email || "",
          college: profileData.college || user.user_metadata?.college || "",
        };
        setForm(userData);
        setDraft(userData);
      }

      // Fetch user's listed books
      const { data: booksData } = await supabase
        .from("books")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch wishlist
      let wishlistData = [];
      const { data: wd } = await supabase
        .from("wishlist")
        .select("book_id")
        .eq("user_id", user.id);
      if (wd) wishlistData = wd;

      // Fetch transactions - both as buyer and seller
      const { data: buyerTx } = await supabase
        .from("transactions")
        .select("*, books(price)")
        .eq("buyer_id", user.id);

      const { data: sellerTx } = await supabase
        .from("transactions")
        .select("*, books(price)")
        .eq("seller_id", user.id);

      // Calculate stats
      const soldCount = sellerTx?.filter(t => t.status === "completed").length || 0;
      const purchaseCount = buyerTx?.filter(t => t.status === "completed").length || 0;
      const totalEarnings = sellerTx
        ?.filter(t => t.status === "completed")
        .reduce((sum, t) => sum + (t.price || 0), 0) || 0;
      const totalSpent = buyerTx
        ?.filter(t => t.status === "completed")
        .reduce((sum, t) => sum + (t.price || 0), 0) || 0;

      setStats({
        listed: booksData?.length || 0,
        sold: soldCount,
        purchases: purchaseCount,
        wishlist: wishlistData?.length || 0,
        totalEarnings,
        totalSpent,
      });
    };

    loadProfileData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage("");

    const { data: { session } } = await supabase.auth.getSession();
    const uid = userId || session?.user?.id;

    if (!uid) {
      setSaveMessage("Error saving profile");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: draft.name,
        college: draft.college,
      })
      .eq("id", uid);

    if (error) {
      console.error("Profile save error:", error);
      setSaveMessage("Error saving profile: " + error.message);
    } else {
      setForm(draft);
      setSaveMessage("Profile saved successfully!");
      setIsEditing(false);
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          color.includes("blue") ? "bg-blue-100" :
          color.includes("green") ? "bg-green-100" :
          color.includes("amber") ? "bg-amber-100" :
          color.includes("purple") ? "bg-purple-100" :
          color.includes("red") ? "bg-red-100" :
          "bg-gray-100"
        }`}>
          <Icon size={18} className={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={[]} />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile Hero */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-medium shrink-0">
              {form.name ? form.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <div>
                <p className="text-xl font-medium text-gray-900">{form.name || "Loading..."}</p>
                <p className="text-sm text-gray-500 mt-0.5">{form.email}</p>
                {form.college && <p className="text-sm text-gray-500 mt-0.5">{form.college}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/sellbook")}
                className="text-sm bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold rounded-lg px-4 py-2 hover:scale-105 transition shadow-sm shadow-blue-200"
              >
                + Sell a Book
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {saveMessage && (
                <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${
                  saveMessage.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {saveMessage}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">College / Institution</label>
                  <input
                    type="text"
                    value={draft.college}
                    onChange={(e) => setDraft({ ...draft, college: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-gray-900 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={() => { setDraft(form); setIsEditing(false); }}
                  className="text-sm border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 transition"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={BookOpen}
            label="Listed Books"
            value={stats.listed}
            color="text-blue-600"
          />
          <StatCard
            icon={Package}
            label="Sold"
            value={stats.sold}
            color="text-green-600"
          />
          <StatCard
            icon={ShoppingBag}
            label="Purchases"
            value={stats.purchases}
            color="text-purple-600"
          />
          <StatCard
            icon={Heart}
            label="Wishlist"
            value={stats.wishlist}
            color="text-rose-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Total Earnings"
            value={`₹${stats.totalEarnings}`}
            subtext="From sales"
            color="text-emerald-600"
          />
          <StatCard
            icon={Clock}
            label="Total Spent"
            value={`₹${stats.totalSpent}`}
            subtext="On purchases"
            color="text-amber-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => navigate("/my-books")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Books</span>
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Package size={18} className="text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Orders</span>
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <ShoppingCart size={18} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Cart</span>
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart size={18} className="text-rose-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Wishlist</span>
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Notifications</span>
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
