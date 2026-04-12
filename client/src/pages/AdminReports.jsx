import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Flag, CheckCircle, XCircle, AlertTriangle, Eye, Trash2 } from "lucide-react";

const REASON_LABELS = {
  inappropriate_content: "Inappropriate Content",
  fake_listing: "Fake/Fraudulent Listing",
  wrong_category: "Wrong Category/Genre",
  damaged_not_disclosed: "Damage Not Disclosed",
  overpriced: "Severely Overpriced",
  prohibited_item: "Prohibited Item",
  fake_seller: "Fake Seller",
  harassment: "Harassment/Abusive Behavior",
  no_response: "No Response",
  misrepresentation: "Misrepresentation",
  price_manipulation: "Price Manipulation",
  spam: "Spam/Scam",
  other: "Other",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  dismissed: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminReports({ isLoggedIn, onLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchReports();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
  };

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:profiles!reports_reported_by_fkey (
          full_name,
          email,
          college
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      alert("Error updating report: " + error.message);
    } else {
      fetchReports();
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      alert("Error deleting report: " + error.message);
    } else {
      fetchReports();
    }
  };

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setShowDetails(true);

    // Fetch additional details based on report type
    if (report.report_type === "book") {
      const { data: bookData } = await supabase
        .from("books")
        .select("*, authors(name)")
        .eq("id", report.target_id)
        .single();
      setSelectedReport(prev => ({ ...prev, targetData: bookData }));
    } else if (report.report_type === "seller") {
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", report.target_id)
        .single();
      setSelectedReport(prev => ({ ...prev, targetData: sellerData }));
    }
  };

  const filteredReports = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500">Only administrators can view this page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Management</h1>
          <p className="text-gray-500">Review and manage user reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Flag className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.dismissed}</p>
                <p className="text-xs text-gray-500">Dismissed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { value: "all", label: "All Reports" },
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "resolved", label: "Resolved" },
            { value: "dismissed", label: "Dismissed" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-2 text-xs opacity-75">
                  {reports.filter(r => r.status === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports</h3>
            <p className="text-gray-500 text-sm">
              {filter === "all" ? "There are no reports yet." : `No ${filter} reports.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    report.report_type === "seller" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    <Flag className={`w-5 h-5 ${
                      report.report_type === "seller" ? "text-red-600" : "text-blue-600"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            report.report_type === "seller"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}>
                            {report.report_type === "seller" ? "Seller" : "Book"}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            STATUS_STYLES[report.status]
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {REASON_LABELS[report.reason] || report.reason}
                        </p>
                        {report.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {report.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewDetails(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Eye size={14} />
                        View Details
                      </button>

                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report.id, "resolved")}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                          >
                            <CheckCircle size={14} />
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, "dismissed")}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                          >
                            <XCircle size={14} />
                            Dismiss
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Report Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Report Type:</span>
                    <span className="font-medium capitalize">{selectedReport.report_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium">{REASON_LABELS[selectedReport.reason]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[selectedReport.status]
                    }`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reported By:</span>
                    <span className="font-medium">
                      {selectedReport.reporter?.full_name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>
              )}

              {/* Target Details */}
              {selectedReport.targetData && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {selectedReport.report_type === "book" ? "Book Details" : "Seller Details"}
                  </h3>
                  {selectedReport.report_type === "book" ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Title:</span>
                        <span className="font-medium">{selectedReport.targetData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Author:</span>
                        <span className="font-medium">{selectedReport.targetData.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">₹{selectedReport.targetData.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Seller:</span>
                        <span className="font-medium">{selectedReport.targetData.seller_name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{selectedReport.targetData.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{selectedReport.targetData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">College:</span>
                        <span className="font-medium">{selectedReport.targetData.college}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                {selectedReport.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReport.id, "resolved");
                        setShowDetails(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition"
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedReport.id, "dismissed");
                        setShowDetails(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
