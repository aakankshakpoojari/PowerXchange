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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (!profileData || profileData.role !== "admin") {
      navigate("/home");
      return;
    }
    fetchUsers();
  }

  async function fetchUsers() {
    setLoading(true);
    let query = supabase.from("profiles").select("*");
    if (filter === "verified") {
      query = query.eq("status", "approved");
    } else if (filter === "pending") {
      query = query.eq("status", "pending");
    }
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (!error) setUsers(data);
    setLoading(false);
  }

  function viewUserDetails(user) {
    setSelectedUser(user);
    setShowModal(true);
  }

  function viewUserDetails(user) {
    setSelectedUser(user);
    setShowModal(true);
  }

  async function handleVerify(userId, isVerified) {
    setActionLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ status: isVerified ? "pending" : "approved" })
      .eq("id", userId);
    if (!error) fetchUsers();
    setActionLoading(false);
  }

  async function handleBlock(userId, isBlocked) {
    setActionLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !isBlocked })
      .eq("id", userId);
    if (!error) fetchUsers();
    setActionLoading(false);
  }

  async function handleDelete(userId) {
    if (!userId) {
      alert("Invalid user ID");
      return;
    }
    setActionLoading(true);
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      alert("User deleted successfully!");
      fetchUsers();
    }
    setShowModal(false);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
    setActionLoading(false);
  }

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-indigo-200 hover:text-white">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); navigate("/"); }}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full">
        {/* (everything same, unchanged) */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "verified" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "pending" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-64"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                            {user.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.college || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.photo_url ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Photo ✓</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">No Photo</span>
                        )}
                        {user.id_card_url ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">ID Card ✓</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">No ID</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === "approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {user.status === "approved" ? "Approved" : "Pending"}
                        </span>
                        {user.is_blocked && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Blocked</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleVerify(user.id, user.status === "approved")}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-sm rounded-lg transition ${
                            user.status === "approved"
                              ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {user.status === "approved" ? "Mark Pending" : "Verify"}
                        </button>
                        <button
                          onClick={() => handleBlock(user.id, user.is_blocked || false)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-sm rounded-lg transition ${
                            user.is_blocked
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                        >
                          {user.is_blocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => { setSelectedUser({ id: user.id, full_name: user.full_name, email: user.email, photo_url: user.photo_url, id_card_url: user.id_card_url, college: user.college, usn: user.usn, status: user.status, is_blocked: user.is_blocked, role: user.role, created_at: user.created_at }); setShowModal(true); }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* User Details Modal */}
      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl mx-4 my-8 w-full">
            {showDeleteConfirm ? (
              // Delete Confirmation View
              <>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                  <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{selectedUser.full_name}</strong> ({selectedUser.email})?
                  <br />
                  <span className="text-red-600 text-sm">This action cannot be undone. All their books and data will be deleted.</span>
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(selectedUser.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            ) : (
              // User Details View
              <>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

            <div className="space-y-6">
              {/* Profile Section */}
              <div className="border-b pb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Profile Information</h4>
                <div className="flex gap-6">
                  {selectedUser.photo_url ? (
                    <img src={selectedUser.photo_url} alt={selectedUser.full_name} className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl font-medium">
                      {selectedUser.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="font-medium text-gray-900">{selectedUser.email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* College Section */}
              <div className="border-b pb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">College Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">College Name</p>
                    <p className="font-medium text-gray-900">{selectedUser.college || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">USN</p>
                    <p className="font-medium text-gray-900">{selectedUser.usn || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* ID Card Section */}
              <div className="border-b pb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Uploaded Documents</h4>
                {selectedUser.id_card_url ? (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">ID Card</p>
                    <a href={selectedUser.id_card_url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={selectedUser.id_card_url} alt="ID Card" className="w-full max-h-64 object-contain rounded-lg border border-gray-200" />
                    </a>
                    <a href={selectedUser.id_card_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                      Open in new tab →
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No ID card uploaded</p>
                )}
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Account Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full ${
                      selectedUser.status === "approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {selectedUser.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Blocked</p>
                    <p className={`font-medium mt-1 ${selectedUser.is_blocked ? "text-red-600" : "text-green-600"}`}>
                      {selectedUser.is_blocked ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedUser.role || "user"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Joined</p>
                    <p className="font-medium text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Close
              </button>
              <button
                onClick={() => { handleVerify(selectedUser.id, selectedUser.status === "approved"); setSelectedUser(null); }}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedUser.status === "approved"
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {selectedUser.status === "approved" ? "Mark Pending" : "Verify"}
              </button>
              <button
                onClick={() => { handleBlock(selectedUser.id, selectedUser.is_blocked || false); setSelectedUser(null); }}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedUser.is_blocked
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                {selectedUser.is_blocked ? "Unblock" : "Block"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
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