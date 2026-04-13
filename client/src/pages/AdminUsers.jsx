import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      await fetchUsers();
    } catch (err) {
      console.error("Auth error:", err);
      setLoading(false);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("*");
      if (filter === "verified")  query = query.eq("status", "approved");
      else if (filter === "pending") query = query.eq("status", "pending");
      else if (filter === "blocked") query = query.eq("is_blocked", true);
      query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) console.error("Fetch error:", error.message);
      else setUsers(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setLoading(false);
  }

  function viewUserDetails(user) {
    setSelectedUser(user);
    setShowDeleteConfirm(false);
    setShowModal(true);
  }

  async function handleVerify(userId, currentStatus) {
    setActionLoading(true);
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (!error) fetchUsers();
    setActionLoading(false);
  }

  async function handleBlock(userId, isBlocked) {
    setActionLoading(true);
    const { error } = await supabase.from("profiles").update({ is_blocked: !isBlocked }).eq("id", userId);
    if (!error) {
      fetchUsers();
      if (selectedUser?.id === userId) setSelectedUser(prev => ({ ...prev, is_blocked: !isBlocked }));
    }
    setActionLoading(false);
  }

  async function handleDelete(userId) {
    if (!userId) { alert("Invalid user ID"); return; }
    setActionLoading(true);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) alert("Error deleting user: " + error.message);
    else {
      alert("User deleted successfully!");
      fetchUsers();
      setShowModal(false);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
    setActionLoading(false);
  }

  const filteredUsers = users.filter(user =>
    (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.college || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-indigo-200 hover:text-white text-sm">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); navigate("/"); }}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users",   value: users.length,                                    color: "indigo" },
            { label: "Verified",      value: users.filter(u => u.status === "approved").length, color: "green" },
            { label: "Pending",       value: users.filter(u => u.status === "pending").length,  color: "yellow" },
            { label: "Blocked",       value: users.filter(u => u.is_blocked).length,            color: "red" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {["all", "verified", "pending", "blocked"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {f === "all" ? "All Users" : f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, email or college..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-72"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">College</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Blocked</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(user.photo_url || user.image_url) ? (
                            <img
                              src={user.photo_url || user.image_url}
                              alt={user.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-indigo-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                              {(user.full_name || user.email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || "—"}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.college || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                        }`}>{user.role || "user"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : user.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>{user.status || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.is_blocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                        }`}>{user.is_blocked ? "Blocked" : "Active"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium">
                            View
                          </button>
                          <button
                            onClick={() => handleBlock(user.id, user.is_blocked)}
                            disabled={actionLoading}
                            className={`px-3 py-1.5 text-xs rounded-lg transition font-medium disabled:opacity-50 ${
                              user.is_blocked
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}>
                            {user.is_blocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8">
            {showDeleteConfirm ? (
              <>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Delete User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to permanently delete{" "}
                  <strong>{selectedUser.full_name || selectedUser.email}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(selectedUser.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">
                    {actionLoading ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <button
                    onClick={() => { setSelectedUser(null); setShowModal(false); }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-5">
                  {(selectedUser.photo_url || selectedUser.image_url) ? (
                    <img
                      src={selectedUser.photo_url || selectedUser.image_url}
                      alt={selectedUser.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border-2 border-indigo-200">
                      {(selectedUser.full_name || selectedUser.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{selectedUser.full_name || "—"}</p>
                    <p className="text-sm text-gray-400">{selectedUser.email}</p>
                    {selectedUser.usn && (
                      <p className="text-xs text-indigo-500 font-medium mt-0.5">USN: {selectedUser.usn}</p>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm mb-4">
                  {[
                    ["College",  selectedUser.college  || "—"],
                    ["Phone",    selectedUser.phone    || "—"],
                    ["Location", selectedUser.location || "—"],
                    ["Role",     selectedUser.role     || "user"],
                    ["Status",   selectedUser.status   || "—"],
                    ["Blocked",  selectedUser.is_blocked ? "Yes" : "No"],
                    ["Joined",   selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}:</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>

                {/* ID Card */}
                {selectedUser.id_card_url && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">ID Card</p>
                    <a href={selectedUser.id_card_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedUser.id_card_url}
                        alt="ID Card"
                        className="w-full rounded-xl border border-gray-200 object-cover max-h-48 hover:opacity-90 transition cursor-pointer"
                      />
                      <p className="text-xs text-indigo-500 mt-1 text-center">Click to open full size</p>
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleVerify(selectedUser.id, selectedUser.status)}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                      selectedUser.status === "approved"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}>
                    {selectedUser.status === "approved" ? "Revoke Approval" : "Approve User"}
                  </button>
                  <button
                    onClick={() => handleBlock(selectedUser.id, selectedUser.is_blocked)}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                      selectedUser.is_blocked
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}>
                    {selectedUser.is_blocked ? "Unblock User" : "Block User"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium text-sm transition">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}