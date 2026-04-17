import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Package, ShoppingBag, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const STATUS_STYLES = {
  pending:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", icon: Clock,       label: "Pending" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle, label: "Completed" },
  cancelled: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   icon: XCircle,     label: "Cancelled" },
};

export default function OrdersPage({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("purchases");
  const [purchases, setPurchases] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
    // Check if navigated from a notification with tab state
    if (location.state?.tab === "incoming") {
      setActiveTab("incoming");
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    setUserId(user.id);

    try {
      // Load purchases (as buyer) - use shorthand join syntax that works with Supabase
      const { data: buyerTx, error: buyerErr } = await supabase
        .from("transactions")
        .select("*, books(id, title, author, image_url, genre, condition, price), seller:seller_id(full_name, email, college)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (buyerErr) {
        console.error("Error loading purchases:", buyerErr);
        // Tables should be set up now, so don't show the alert
        // If there's still an error, it's likely a permissions issue
      }
      setPurchases(buyerTx || []);

      // Load incoming orders (as seller)
      const { data: sellerTx, error: sellerErr } = await supabase
        .from("transactions")
        .select("*, books(id, title, author, image_url, genre, condition, price), buyer:buyer_id(full_name, email, college)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (sellerErr) {
        console.error("Error loading incoming orders:", sellerErr);
      }
      setIncoming(sellerTx || []);
    } catch (err) {
      console.error("Unexpected error loading orders:", err);
    }

    setLoading(false);
  };

  const handleAccept = async (tx) => {
    setActionLoading(tx.id);
    try {
      // Update transaction status
      const { error } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", tx.id);

      if (error) throw error;

      // Send notification to buyer
      try {
        const buyerId = tx.buyer_id;
        const bookTitle = tx.books?.title || "the book";
        const sellerName = tx.seller?.full_name || tx.seller?.name || "The seller";

        await supabase.from("notifications").insert({
          user_id: buyerId,
          type: "request_accepted",
          title: "Your request has been accepted! 🎉",
          message: `${sellerName} has accepted your request for "${bookTitle}". View the bill and payment details in your orders.`,
          transaction_id: tx.id,
        });
      } catch (notifErr) {
        console.error("Error sending notification:", notifErr);
      }

      setSuccessMsg("Order accepted successfully! The buyer has been notified.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (err) {
      alert("Error accepting order: " + err.message);
    }
    setActionLoading(null);
  };

  const handleDecline = async (tx) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    setActionLoading(tx.id);
    try {
      // Update transaction status
      const { error } = await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("id", tx.id);

      if (error) throw error;

      // Restore book quantity
      if (tx.books?.id) {
        const { data: book } = await supabase
          .from("books")
          .select("quantity")
          .eq("id", tx.books.id)
          .single();

        if (book) {
          await supabase
            .from("books")
            .update({ quantity: (book.quantity || 0) + 1, is_available: true })
            .eq("id", tx.books.id);
        }
      }

      setSuccessMsg("Order declined.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (err) {
      alert("Error declining order: " + err.message);
    }
    setActionLoading(null);
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

  const StatusBadge = ({ status }) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
        <Icon size={13} />
        {s.label}
      </span>
    );
  };

  const OrderCard = ({ tx, role }) => {
    const book = tx.books || {};
    const otherPerson = role === "buyer" ? tx.seller : tx.buyer;
    const personName = otherPerson?.full_name || otherPerson?.name || "User";
    const personCollege = otherPerson?.college || "";
    const isExchange = tx.notes?.startsWith("[EXCHANGE:");

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200">
        <div className="flex gap-4">
          {/* Book Cover */}
          <div
            className="w-28 h-40 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0 cursor-pointer"
            onClick={() => book.id && navigate(`/books/${book.id}`)}
          >
            {book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/112x160?text=Book"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs font-medium">
                {book.genre || "📚"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {book.title || "Book"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{book.author || ""}</p>
              </div>
              <StatusBadge status={tx.status} />
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                isExchange ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-violet-50 text-violet-700 border border-violet-200"
              }`}>
                {isExchange ? "📦 Exchange" : "💰 Purchase"}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(tx.created_at)} at {formatTime(tx.created_at)}
              </span>
            </div>

            {/* Person info */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                {personName[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {role === "buyer" ? "Seller" : "Buyer"}: {personName}
                </p>
                {personCollege && <p className="text-xs text-gray-400">{personCollege}</p>}
              </div>
            </div>

            {/* Notes */}
            {tx.notes && (
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Message:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{tx.notes}</p>
              </div>
            )}

            {/* Price + Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-lg font-bold text-blue-700">₹{tx.price || 0}</span>

              <div className="flex items-center gap-2">
                {/* Accept/Decline for seller on pending orders */}
                {role === "seller" && tx.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAccept(tx)}
                      disabled={actionLoading === tx.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(tx)}
                      disabled={actionLoading === tx.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Decline
                    </button>
                  </>
                )}

                {/* View Details */}
                <button
                  onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "purchases", label: "My Purchases", icon: ShoppingBag, count: purchases.length },
    { key: "incoming",  label: "Incoming Orders",  icon: Package,     count: incoming.length },
  ];

  const pendingIncoming = incoming.filter(t => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">Track your purchases and incoming book requests</p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition shadow-lg shadow-blue-200 text-sm"
          >
            Browse Books
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
            <p className="text-sm text-gray-500">Total Purchases</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{incoming.length}</p>
            <p className="text-sm text-gray-500">Incoming Orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{pendingIncoming}</p>
            <p className="text-sm text-gray-500">Pending Requests</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">
              {purchases.filter(t => t.status === "completed").length + incoming.filter(t => t.status === "completed").length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-700 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.key === "incoming" && pendingIncoming > 0 && activeTab !== "incoming" && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* My Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
                <p className="text-gray-500 text-sm mb-6">Start by browsing and requesting books you'd like to buy</p>
                <button
                  onClick={() => navigate("/home")}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Browse Books
                </button>
              </div>
            ) : (
              purchases.map((tx) => <OrderCard key={tx.id} tx={tx} role="buyer" />)
            )}
          </div>
        )}

        {/* Incoming Orders Tab */}
        {activeTab === "incoming" && (
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No incoming orders</h3>
                <p className="text-gray-500 text-sm mb-6">When someone requests to buy your book, it will appear here</p>
                <button
                  onClick={() => navigate("/sellbook")}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  List a Book
                </button>
              </div>
            ) : (
              incoming.map((tx) => <OrderCard key={tx.id} tx={tx} role="seller" />)
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
} 