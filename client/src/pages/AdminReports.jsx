import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

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

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { checkAdminAndLoad(); }, [filter]);

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (!profileData || profileData.role !== "admin") { navigate("/home"); return; }
    fetchReports();
  }

  async function fetchReports() {
    setLoading(true);
    let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (filter === "pending")   query = query.eq("status", "pending");
    if (filter === "resolved")  query = query.eq("status", "resolved");
    if (filter === "dismissed") query = query.eq("status", "dismissed");

    const { data, error } = await query;
    if (error) { console.error("Error fetching reports:", error); setLoading(false); return; }

    const reportsData = data || [];
    if (reportsData.length > 0) {
      const ids = [...new Set(reportsData.map(r => r.reported_by).filter(Boolean))];
      const { data: profilesData } = await supabase.from("profiles").select("id, full_name, email, college").in("id", ids);
      const map = {};
      (profilesData || []).forEach(p => { map[p.id] = p; });
      setReports(reportsData.map(r => ({ ...r, reporter: map[r.reported_by] || null })));
    } else {
      setReports([]);
    }
    setLoading(false);
  }

  async function handleUpdateStatus(reportId, newStatus) {
    setActionLoading(true);
    const { error } = await supabase.from("reports").update({ status: newStatus }).eq("id", reportId);
    if (error) alert("Error: " + error.message);
    else { fetchReports(); setShowModal(false); setSelectedReport(null); }
    setActionLoading(false);
  }

  async function handleDelete(reportId) {
    if (!confirm("Delete this report?")) return;
    setActionLoading(true);
    const { error } = await supabase.from("reports").delete().eq("id", reportId);
    if (error) alert("Error: " + error.message);
    else { fetchReports(); setShowModal(false); setSelectedReport(null); }
    setActionLoading(false);
  }

  async function viewDetails(report) {
    setSelectedReport(report);
    setShowModal(true);
    if (report.report_type === "book") {
      const { data } = await supabase.from("books").select("*").eq("id", report.target_id).single();
      setSelectedReport(prev => ({ ...prev, targetData: data }));
    } else {
      const { data } = await supabase.from("profiles").select("*").eq("id", report.target_id).single();
      setSelectedReport(prev => ({ ...prev, targetData: data }));
    }
  }

  const filteredReports = reports.filter(r =>
    r.reporter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    REASON_LABELS[r.reason]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.report_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Loading reports...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-indigo-200 hover:text-white text-sm">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl font-bold">Report Management</h1>
          </div>
          <button onClick={() => { supabase.auth.signOut(); navigate("/"); }}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition text-sm">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {["all","pending","resolved","dismissed"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {f === "all" ? "All Reports" : f}
                <span className="ml-1.5 text-xs opacity-75">
                  ({f === "all" ? reports.length : reports.filter(r => r.status === f).length})
                </span>
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search by reporter, reason, type..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-72" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center text-gray-500">No reports found</div>
          ) : filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className={`h-2 ${report.report_type === "seller" ? "bg-red-500" : "bg-blue-500"}`} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    report.report_type === "seller" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {report.report_type === "seller" ? "👤 User Report" : "📚 Book Report"}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    report.status === "pending"   ? "bg-amber-100 text-amber-700 border-amber-200" :
                    report.status === "resolved"  ? "bg-green-100 text-green-700 border-green-200" :
                    report.status === "dismissed" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                                    "bg-blue-100 text-blue-700 border-blue-200"
                  }`}>{report.status}</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 truncate">{REASON_LABELS[report.reason] || report.reason}</h3>
                <p className="text-sm text-gray-500 mb-0.5">By: <span className="text-gray-700 font-medium">{report.reporter?.full_name || "Anonymous"}</span></p>
                <p className="text-xs text-gray-400 mb-1">{report.reporter?.college || ""}</p>
                {report.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 italic">"{report.description}"</p>
                )}
                <p className="text-xs text-gray-400 mb-4">
                  {new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => viewDetails(report)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium">
                    View Details
                  </button>
                  {report.status === "pending" && (
                    <button onClick={() => handleUpdateStatus(report.id, "resolved")} disabled={actionLoading}
                      className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium disabled:opacity-50">
                      Resolve
                    </button>
                  )}
                  <button onClick={() => handleDelete(report.id)} disabled={actionLoading}
                    className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Report Details</h3>
              <button onClick={() => { setShowModal(false); setSelectedReport(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium capitalize">{selectedReport.report_type === "seller" ? "User" : "Book"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Reason:</span><span className="font-medium">{REASON_LABELS[selectedReport.reason]}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    selectedReport.status === "pending"   ? "bg-amber-100 text-amber-700 border-amber-200" :
                    selectedReport.status === "resolved"  ? "bg-green-100 text-green-700 border-green-200" :
                                                            "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>{selectedReport.status}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Reported By:</span><span className="font-medium">{selectedReport.reporter?.full_name || "Anonymous"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="font-medium">{new Date(selectedReport.created_at).toLocaleString()}</span></div>
              </div>

              {selectedReport.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedReport.description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  {selectedReport.report_type === "book" ? "Book Info" : "Reported User Info"}
                </p>
                {selectedReport.targetData ? (
                  selectedReport.report_type === "book" ? (
                    <>
                      <div className="flex justify-between"><span className="text-gray-500">Title:</span><span className="font-medium">{selectedReport.targetData.title}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Author:</span><span className="font-medium">{selectedReport.targetData.author}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Price:</span><span className="font-medium">₹{selectedReport.targetData.price}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Seller:</span><span className="font-medium">{selectedReport.targetData.seller_name}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{selectedReport.targetData.full_name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium">{selectedReport.targetData.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">College:</span><span className="font-medium">{selectedReport.targetData.college}</span></div>
                    </>
                  )
                ) : <p className="text-gray-400 italic text-xs">Loading...</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedReport.status === "pending" && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedReport.id, "resolved")} disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                    Mark Resolved
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")} disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium">
                    Dismiss
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(selectedReport.id)} disabled={actionLoading}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium">
                Delete
              </button>
              <button onClick={() => { setShowModal(false); setSelectedReport(null); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}