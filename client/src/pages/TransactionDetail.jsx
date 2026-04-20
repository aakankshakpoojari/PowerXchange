import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { ArrowLeft, Printer, CheckCircle, XCircle, Clock, Package, User, MapPin, Mail, Phone, Calendar, Hash, FileText } from "lucide-react";
import UserBadge from "../components/UserBadge";

const STATUS_CONFIG = {
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-300",   icon: Clock,       label: "Pending",   dot: "bg-amber-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", icon: CheckCircle, label: "Completed", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-300",     icon: XCircle,     label: "Cancelled", dot: "bg-red-500" },
};

export default function TransactionDetail({ isLoggedIn, onLogout, cart, wishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          books(id, title, author, image_url, genre, condition, price, description, seller_name, seller_email, seller_phone, seller_address, seller_city, seller_pincode),
          buyer:buyer_id(id, full_name, email, college, phone),
          seller:seller_id(id, full_name, email, college, phone)
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching transaction:", error);
        setLoading(false);
        return;
      }

      // Only allow buyer or seller to view
      if (data.buyer_id !== user.id && data.seller_id !== user.id) {
        navigate("/orders");
        return;
      }

      setTx(data);
      setLoading(false);
    };

    fetchTransaction();
  }, [id, navigate]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="text-5xl">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900">Transaction not found</h2>
          <p className="text-gray-500">This transaction may have been removed or you don't have access.</p>
          <button onClick={() => navigate("/orders")} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  const book = tx.books || {};
  const buyer = tx.buyer || {};
  const seller = tx.seller || {};
  const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isBuyer = currentUserId === tx.buyer_id;
  const isExchange = tx.notes?.startsWith("[EXCHANGE:");
  const exchangeBook = isExchange ? tx.notes.match(/\[EXCHANGE: (.+?)\]/)?.[1] : null;
  const message = isExchange ? tx.notes.replace(/\[EXCHANGE: .+?\]\s*/, "") : tx.notes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <Printer size={15} />
            Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div className="">

          {/* Header */}
          <div className={`${status.bg} ${status.border} border-b px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Transaction Receipt
                </h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Hash size={13} />
                    {tx.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(tx.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${status.bg} ${status.text} border ${status.border}`}>
                <StatusIcon size={16} />
                {status.label}
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Book Details</h2>
            <div className="flex gap-5">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0">
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/80x112?text=Book"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-400 text-2xl">📚</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{book.title || "Book"}</h3>
                <p className="text-sm text-gray-500 mt-0.5">by {book.author || "Unknown"}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {book.genre && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      {book.genre}
                    </span>
                  )}
                  {book.condition && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {book.condition}
                    </span>
                  )}
                  {isExchange && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                      📦 Exchange
                    </span>
                  )}
                </div>
                {book.description && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{book.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Buyer & Seller */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

            {/* Buyer */}
            <div className="px-6 py-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <User size={13} />
                Buyer
                {isBuyer && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium normal-case">You</span>}
              </h2>
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-900">
                  <UserBadge userName={buyer.full_name || "N/A"} userId={buyer.id} />
                </p>
                {buyer.college && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" />
                    {buyer.college}
                  </p>
                )}
                {buyer.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail size={13} className="text-gray-400" />
                    {buyer.email}
                  </p>
                )}
                {buyer.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone size={13} className="text-gray-400" />
                    {buyer.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Seller */}
            <div className="px-6 py-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Package size={13} />
                Seller
                {!isBuyer && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium normal-case">You</span>}
              </h2>
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-900">
                  <UserBadge userName={seller.full_name || book.seller_name || "N/A"} userId={seller.id} />
                </p>
                {seller.college && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" />
                    {seller.college}
                  </p>
                )}
                {seller.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail size={13} className="text-gray-400" />
                    {seller.email}
                  </p>
                )}
                {seller.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone size={13} className="text-gray-400" />
                    {seller.phone}
                  </p>
                )}
                {book.seller_address && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" />
                    {book.seller_address}{book.seller_city && `, ${book.seller_city}`} {book.seller_pincode && `- ${book.seller_pincode}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Exchange Info */}
          {isExchange && exchangeBook && (
            <div className="px-6 py-4 border-t border-gray-100 bg-teal-50/50">
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">Exchange Offer</h2>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Book offered:</span> {exchangeBook}
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Message</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
            </div>
          )}

           {/* Price Summary */}
          <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Book Price</span>
                <span>₹{tx.price || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-blue-700">₹{tx.price || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {tx.status === "completed" && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">Payment Instructions</h2>
              <div className="space-y-2 text-sm text-amber-800">
                <p className="font-medium">Payment Method:</p>
                <p className="bg-white rounded-lg p-3 border border-amber-200">
                  💸 <strong>Direct Payment</strong> - This platform does not handle payments. Please arrange payment directly with the seller using your preferred method (UPI, Cash, Bank Transfer, etc.).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <p className="font-medium text-xs text-amber-700 mb-1">For Buyers:</p>
                    <p className="text-xs">Contact the seller to arrange payment. Keep this transaction ID ({tx.id.slice(0, 8)}) for reference.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <p className="font-medium text-xs text-amber-700 mb-1">For Sellers:</p>
                    <p className="text-xs">Coordinate with the buyer to receive payment. This transaction is complete and verified.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Transaction ID: {tx.id} · Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PowerXchange — College Book Exchange Platform
            </p>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-6 print:hidden">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}
