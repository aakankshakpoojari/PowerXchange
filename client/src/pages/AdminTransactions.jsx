import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import UserBadge from "../components/UserBadge";

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    checkAdminAndLoad();
  }, [filter]);

  async function checkAdminAndLoad() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) { navigate("/login"); return; }
      const session = data.session;
      const { data: profileData, error: profileError } = await supabase
        .from("profiles").select("role").eq("id", session.user.id).single();
      if (profileError || !profileData || profileData.role !== "admin") { navigate("/home"); return; }
      await fetchTransactions();
    } catch (err) {
      console.error("Auth check error:", err);
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    setLoading(true);
    try {
      // Step 1: Fetch transactions with filter
      let query = supabase.from("transactions").select("*");

      if (filter === "completed") {
        query = query.eq("status", "completed");
      } else if (filter === "pending") {
        query = query.eq("status", "pending");
      } else if (filter === "cancelled") {
        query = query.eq("status", "cancelled");
      }

      query = query.order("created_at", { ascending: false });

      const { data: txData, error: txError } = await query;

      if (txError) {
        console.error("Transaction fetch error:", txError);
        throw txError;
      }

      console.log("Transactions fetched:", txData?.length || 0);

      if (!txData || txData.length === 0) {
        console.log("No transactions found in database");
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch books info
      const bookIds = [...new Set(txData.map(tx => tx.book_id).filter(Boolean))];
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, title")
        .in("id", bookIds);
      if (booksError) console.error("Books fetch error:", booksError);
      const booksMap = {};
      (booksData || []).forEach(b => { booksMap[b.id] = b; });

      // Step 3: Fetch buyer profiles
      const buyerIds = [...new Set(txData.map(tx => tx.buyer_id).filter(Boolean))];
      const { data: buyersData, error: buyersError } = await supabase
        .from("profiles")
        .select("id, full_name, college")
        .in("id", buyerIds);
      if (buyersError) console.error("Buyers fetch error:", buyersError);
      const buyersMap = {};
      (buyersData || []).forEach(b => { buyersMap[b.id] = b; });

      // Step 4: Fetch seller profiles
      const sellerIds = [...new Set(txData.map(tx => tx.seller_id).filter(Boolean))];
      const { data: sellersData, error: sellersError } = await supabase
        .from("profiles")
        .select("id, full_name, college")
        .in("id", sellerIds);
      if (sellersError) console.error("Sellers fetch error:", sellersError);
      const sellersMap = {};
      (sellersData || []).forEach(s => { sellersMap[s.id] = s; });

      // Step 5: Combine data
      const enriched = txData.map(tx => ({
        ...tx,
        books: booksMap[tx.book_id] || null,
        buyer: buyersMap[tx.buyer_id] || null,
        seller: sellersMap[tx.seller_id] || null,
      }));

      console.log("Enriched transactions:", enriched.length);
      setTransactions(enriched);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    }
    setLoading(false);
  }

  async function updateStatus(transactionId, status) {
    const { error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", transactionId);

    if (!error) fetchTransactions();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-200 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">Transaction Management</h1>
              <p className="text-indigo-200 text-sm">View and manage book transactions</p>
            </div>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); navigate("/"); }}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-2 flex-wrap w-full">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-full">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      #{tx.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tx.books?.title || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">
                          <UserBadge userName={tx.buyer?.full_name || "N/A"} userId={tx.buyer?.id} />
                        </p>
                        <p className="text-xs text-gray-400">{tx.buyer?.college || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">
                          <UserBadge userName={tx.seller?.full_name || "N/A"} userId={tx.seller?.id} />
                        </p>
                        <p className="text-xs text-gray-400">{tx.seller?.college || ""}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                      ₹{tx.price || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateStatus(tx.id, "completed")}
                            className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(tx.id, "cancelled")}
                            className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}