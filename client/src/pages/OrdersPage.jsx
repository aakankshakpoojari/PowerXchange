import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { notifyWishlistUsers } from "../notificationHelpers";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Package, ShoppingBag, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import UserBadge from "../components/UserBadge";

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
    if (location.state?.tab === "incoming") {
      setActiveTab("incoming");
      window.history.replaceState({}, document.title);
    }
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    setUserId(user.id);

    try {
      const { data: buyerTx, error: buyerErr } = await supabase
        .from("transactions")
        .select("*, books(id, title, author, image_url, genre, condition, price), seller:seller_id(full_name, email, college)")
        .eq("buyer_id", user.id)
        .in("status", ["pending", "completed"])
        .order("created_at", { ascending: false });

      if (buyerErr) console.error("Error loading purchases:", buyerErr);
      setPurchases(buyerTx || []);

      const { data: sellerTx, error: sellerErr } = await supabase
        .from("transactions")
        .select("*, books(id, title, author, image_url, genre, condition, price), buyer:buyer_id(full_name, email, college)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (sellerErr) console.error("Error loading incoming orders:", sellerErr);
      setIncoming(sellerTx || []);
    } catch (err) {
      console.error("Unexpected error loading orders:", err);
    }

    setLoading(false);
  };

  const cancelOtherPendingRequests = async ({ bookId, acceptedTxId, sellerId, bookTitle, sellerName }) => {
    try {
      const { data: pendingRequests, error: requestErr } = await supabase
        .from("transactions")
        .select("id, buyer_id")
        .eq("book_id", bookId)
        .eq("seller_id", sellerId)
        .eq("status", "pending")
        .neq("id", acceptedTxId);

      if (requestErr) {
        console.error("Error fetching other pending requests:", requestErr);
        return;
      }

      if (!pendingRequests || pendingRequests.length === 0) return;

      const pendingIds = pendingRequests.map((request) => request.id);
      const { error: cancelErr } = await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .in("id", pendingIds);

      if (cancelErr) {
        console.error("Error cancelling other pending requests:", cancelErr);
      }

      const notifications = pendingRequests.map((request) => ({
        user_id: request.buyer_id,
        type: "request_declined",
        title: "Your request could not be fulfilled",
        message: `${sellerName} has accepted another request for "${bookTitle}". Your request has been cancelled.`,
        transaction_id: request.id,
      }));

      const { error: notifErr } = await supabase.from("notifications").insert(notifications);
      if (notifErr) {
        console.error("Error notifying buyers about cancelled requests:", notifErr);
      }
    } catch (err) {
      console.error("Unexpected error cancelling other pending requests:", err);
    }
  };

  const handleAccept = async (tx) => {
    setActionLoading(tx.id);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", tx.id);

      if (error) throw error;

      // Mark the book sold/unavailable only when the seller accepts the request.
      let bookNowUnavailable = false;
      if (tx.books?.id) {
        const bookUpdate = {};
        if (typeof tx.books.quantity === "number") {
          const newQuantity = Math.max((tx.books.quantity || 0) - 1, 0);
          bookUpdate.quantity = newQuantity;
          if (newQuantity <= 0) {
            bookUpdate.is_available = false;
            bookNowUnavailable = true;
          }
        } else {
          bookUpdate.is_available = false;
          bookNowUnavailable = true;
        }

        if (Object.keys(bookUpdate).length > 0) {
          await supabase.from("books").update(bookUpdate).eq("id", tx.books.id);
        }
      }

      if (tx.books?.id) {
        try {
          await supabase.rpc("increment_book_sales", { p_book_id: tx.books.id });
        } catch (salesErr) {
          console.error("Error incrementing sales:", salesErr);
        }
      }

      if (bookNowUnavailable && tx.books?.id) {
        try {
          const bookTitle = tx.books?.title || "the book";
          const sellerName = tx.seller?.full_name || "The seller";
          await cancelOtherPendingRequests({
            bookId: tx.books.id,
            acceptedTxId: tx.id,
            sellerId: tx.seller_id,
            bookTitle,
            sellerName,
          });
        } catch (cancelErr) {
          console.error("Error handling other pending requests after accept:", cancelErr);
        }
      }

      // Notify buyer
      try {
        const bookTitle = tx.books?.title || "the book";
        const sellerName = tx.seller?.full_name || "The seller";
        await supabase.from("notifications").insert({
          user_id: tx.buyer_id,
          type: "request_accepted",
          title: "Your request has been accepted! 🎉",
          message: `${sellerName} has accepted your request for "${bookTitle}". View the bill and payment details in your orders.`,
          transaction_id: tx.id,
        });
      } catch (notifErr) {
        console.error("Notification error (non-fatal):", notifErr);
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
      const { error } = await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("id", tx.id);

      if (error) throw error;

      // Notify buyer
      try {
        const bookTitle = tx.books?.title || "the book";
        const sellerName = tx.seller?.full_name || "The seller";
        await supabase.from("notifications").insert({
          user_id: tx.buyer_id,
          type: "request_declined",
          title: "Your request was declined",
          message: `${sellerName} has declined your request for "${bookTitle}".`,
          transaction_id: tx.id,
        });
      } catch (notifErr) {
        console.error("Notification error (non-fatal):", notifErr);
      }

      setSuccessMsg("Order declined. The buyer has been notified.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (err) {
      alert("Error declining order: " + err.message);
    }
    setActionLoading(null);
  };

  const handleCancel = async (tx) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(tx.id);
    try {
      // Step 1: Cancel the transaction
      const { error } = await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("id", tx.id);

      if (error) throw error;

      // Step 2: Notify seller — silently log if it fails, never block the user
      try {
        const bookTitle = tx.books?.title || "the book";
        // Get buyer name fresh from profiles (tx.buyer may be undefined in buyer's own view)
        const { data: { user } } = await supabase.auth.getUser();
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const buyerName = buyerProfile?.full_name || "The buyer";

        await supabase.from("notifications").insert({
          user_id: tx.seller_id,
          type: "order_cancelled",
          title: "Order was cancelled",
          message: `${buyerName} has cancelled their order for "${bookTitle}".`,
          transaction_id: tx.id,
        });
      } catch (notifErr) {
        // Log silently — order is already cancelled, don't alarm the user
        console.error("Notification error (non-fatal):", notifErr);
      }

      setSuccessMsg("Order cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (err) {
      alert("Error cancelling order: " + err.message);
    }
    setActionLoading(null);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

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
          <div
            className="w-28 h-40 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0 cursor-pointer"
            onClick={() => book.id && navigate(`/books/${book.id}`)}
          >
            {book.image_url ? (
              <img src={book.image_url} alt={book.title} className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/112x160?text=Book"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs font-medium">
                {book.genre || "📚"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-base truncate">{book.title || "Book"}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{book.author || ""}</p>
              </div>
              <StatusBadge status={tx.status} />
            </div>

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

            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                {personName[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {role === "buyer" ? "Seller" : "Buyer"}: <UserBadge userName={personName} userId={otherPerson?.id} />
                </p>
                {personCollege && <p className="text-xs text-gray-400">{personCollege}</p>}
              </div>
            </div>

            {tx.notes && (
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Message:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{tx.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-lg font-bold text-blue-700">₹{tx.price || 0}</span>

              <div className="flex items-center gap-2">
                {role === "seller" && tx.status === "pending" && (
                  <>
                    <button onClick={() => handleAccept(tx)} disabled={actionLoading === tx.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button onClick={() => handleDecline(tx)} disabled={actionLoading === tx.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-200 transition disabled:opacity-50">
                      <XCircle size={14} /> Decline
                    </button>
                  </>
                )}

                {role === "buyer" && tx.status === "pending" && (
                  <button onClick={() => handleCancel(tx)} disabled={actionLoading === tx.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-200 transition disabled:opacity-50">
                    <XCircle size={14} /> Cancel Order
                  </button>
                )}

                <button onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition">
                  <Eye size={14} /> View Details
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
    { key: "incoming",  label: "Incoming Orders",  icon: Package,  count: incoming.length },
  ];

  const pendingIncoming = incoming.filter(t => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">Track your purchases and incoming book requests</p>
          </div>
          <button onClick={() => navigate("/home")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition shadow-lg shadow-blue-200 text-sm">
            Browse Books
          </button>
        </div>

        {successMsg && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

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

        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-700 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                <Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>{tab.count}</span>
                )}
                {tab.key === "incoming" && pendingIncoming > 0 && activeTab !== "incoming" && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "purchases" && (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
                <p className="text-gray-500 text-sm mb-6">Start by browsing and requesting books you'd like to buy</p>
                <button onClick={() => navigate("/home")}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                  Browse Books
                </button>
              </div>
            ) : (
              purchases.map((tx) => <OrderCard key={tx.id} tx={tx} role="buyer" />)
            )}
          </div>
        )}

        {activeTab === "incoming" && (
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No incoming orders</h3>
                <p className="text-gray-500 text-sm mb-6">When someone requests to buy your book, it will appear here</p>
                <button onClick={() => navigate("/sellbook")}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
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