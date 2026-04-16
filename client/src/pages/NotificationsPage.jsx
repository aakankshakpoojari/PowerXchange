import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Bell } from "lucide-react";

export default function NotificationsPage({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);

    try {
      const { data: notifs, error: notifErr } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!notifErr && notifs) {
        setNotifications(notifs);
        // Mark all as read
        if (notifs.some(n => !n.is_read)) {
          await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
        }
      }
    } catch (err) {
      console.error("Notifications table may not exist yet:", err);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation();
    try {
      await supabase.from("notifications").delete().eq("id", notifId);
      setNotifications(notifications.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await supabase.from("notifications").delete().eq("user_id", userId);
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : "All caught up!"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={loadNotifications}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  Refresh
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500 text-sm">
              You'll be notified when someone requests your books or responds to your requests
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => notif.transaction_id && navigate(`/transaction/${notif.transaction_id}`)}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all relative ${
                  notif.is_read ? "border-gray-200" : "border-blue-300 bg-blue-50/30"
                }`}
              >
                <button
                  onClick={(e) => handleDeleteNotification(e, notif.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
                <div className="flex items-start gap-3 pr-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl ${
                    notif.type === "purchase_request" ? "bg-amber-100" :
                    notif.type === "request_accepted" ? "bg-emerald-100" :
                    notif.type === "exchange_request" ? "bg-teal-100" :
                    notif.type === "request_cancelled" ? "bg-red-100" :
                    "bg-gray-100"
                  }`}>
                    {notif.type === "purchase_request" ? "🛒" :
                     notif.type === "request_accepted" ? "✅" :
                     notif.type === "exchange_request" ? "📦" :
                     notif.type === "request_cancelled" ? "❌" :
                     "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatDate(notif.created_at)} at {formatTime(notif.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
