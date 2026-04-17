import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import VerifiedBadge from "../components/VerifiedBadge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    totalBooks: 0,
    approvedBooks: 0,
    pendingBooks: 0,
    totalAuthors: 0,
    pendingAuthors: 0,
    totalReports: 0,
    pendingReports: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingAuthors, setPendingAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/login");
      return;
    }

    const user = session.user;

    const [
      profileRes,
      usersCountRes,
      approvedUsersCountRes,
      pendingUsersCountRes,
      booksCountRes,
      approvedBooksCountRes,
      pendingBooksCountRes,
      recentUsersRes,
      pendingUsersRes,
      authorsCountRes,
      pendingAuthorsRes,
      pendingAuthorsListRes,
      reportsCountRes,
      pendingReportsRes
    ] = await Promise.all([
      supabase.from("profiles").select("full_name, email, role").eq("id", user.id).single(),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("books").select("*", { count: "exact", head: true }).eq("is_approved", true),
      supabase.from("books").select("*", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("profiles").select("id, full_name, email, status, college, usn, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("profiles").select("id, full_name, email, status, college, usn").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("authors").select("*", { count: "exact", head: true }),
      supabase.from("authors").select("*", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("authors").select("id, name, genre, created_at").eq("is_approved", false).order("created_at", { ascending: false }).limit(5),
      supabase.from("reports").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    if (profileRes.error || !profileRes.data || profileRes.data.role !== "admin") {
      navigate("/home");
      return;
    }

    setAdmin(profileRes.data);
    setStats({
      totalUsers: usersCountRes.count || 0,
      verifiedUsers: approvedUsersCountRes.count || 0,
      pendingUsers: pendingUsersCountRes.count || 0,
      totalBooks: booksCountRes.count || 0,
      approvedBooks: approvedBooksCountRes.count || 0,
      pendingBooks: pendingBooksCountRes.count || 0,
      totalAuthors: authorsCountRes.count || 0,
      pendingAuthors: pendingAuthorsRes.count || 0,
      totalReports: reportsCountRes.count || 0,
      pendingReports: pendingReportsRes.count || 0,
    });
    setRecentUsers(recentUsersRes.data || []);
    setPendingVerifications(pendingUsersRes.data || []);
    setPendingAuthors(pendingAuthorsListRes.data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-200 text-sm">
              Welcome, {admin?.full_name || admin?.email || "Admin"}
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/home" className="px-4 py-2 text-indigo-100 hover:text-white">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-green-600">{stats.verifiedUsers} verified</span>
              <span className="text-orange-600">{stats.pendingUsers} pending</span>
            </div>
          </div>

          {/* Books Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Books</h3>
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-green-600">{stats.approvedBooks} approved</span>
              <span className="text-orange-600">{stats.pendingBooks} pending</span>
            </div>
          </div>

          {/* Reports Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Reports</h3>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v3m-13 4V8a2 2 0 00-2-2H3a2 2 0 00-2 2v13a2 2 0 002 2h11a2 2 0 002-2v-6a2 2 0 00-2-2H7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-amber-600">{stats.pendingReports} pending</span>
              <span className="text-green-600">{stats.totalReports - stats.pendingReports} resolved</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/authors"
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
              >
                Manage Authors
              </Link>
              <Link
                to="/admin/books"
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
              >
                Manage Books
              </Link>
              <Link
                to="/admin/transactions"
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
              >
                View Transactions
              </Link>
              <Link
                to="/admin/reports"
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Recent Users</h3>
              <Link to="/admin/users" className="text-indigo-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-gray-800">{user.full_name || user.email}</p>
                        <VerifiedBadge isVerified={user.is_verified} size="xs" />
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {user.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pending Verifications</h3>
              <Link to="/admin/users" className="text-indigo-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {pendingVerifications.length === 0 ? (
                <p className="text-gray-500 text-sm">All users approved!</p>
              ) : (
                pendingVerifications.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-gray-800">{user.full_name || user.email}</p>
                        <VerifiedBadge isVerified={user.is_verified} size="xs" />
                      </div>
                      <p className="text-sm text-gray-500">{user.college || user.usn}</p>
                    </div>
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Authors */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pending Authors</h3>
              <Link to="/admin/authors" className="text-indigo-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {pendingAuthors.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending authors!</p>
              ) : (
                pendingAuthors.map((author) => (
                  <div key={author.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{author.name}</p>
                      <p className="text-sm text-gray-500">{author.genre || "No genre"}</p>
                    </div>
                    <Link
                      to="/admin/authors"
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ❌ Footer removed (was causing crash) */}
    </div>
  );
}