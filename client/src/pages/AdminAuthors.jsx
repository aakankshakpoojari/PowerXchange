import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AdminAuthors() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAuthors();
  }, [filter]);

  async function fetchAuthors() {
    setLoading(true);
    let query = supabase
      .from("authors")
      .select("*");

    if (filter === "approved") {
      query = query.eq("is_approved", true);
    } else if (filter === "pending") {
      query = query.eq("is_approved", false);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error) {
      setAuthors(data);
    }
    setLoading(false);
  }

  async function handleApprove(authorId) {
    const { error } = await supabase
      .from("authors")
      .update({ is_approved: true })
      .eq("id", authorId);

    if (!error) {
      alert("Author approved successfully!");
      fetchAuthors();
    } else {
      alert("Error approving author: " + error.message);
    }
  }

  async function handleDelete(authorId) {
    if (!confirm("Are you sure you want to delete this author? All books by this author will be affected.")) {
      return;
    }

    const { error } = await supabase
      .from("authors")
      .delete()
      .eq("id", authorId);

    if (!error) {
      alert("Author deleted successfully!");
      fetchAuthors();
    } else {
      alert("Error deleting author: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading authors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-indigo-200 hover:text-white">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Author Management</h1>
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
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Approved
          </button>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No authors found
            </div>
          ) : (
            authors.map((author) => (
              <div key={author.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {author.photo_url ? (
                    <img src={author.photo_url} alt={author.name} className="w-24 h-24 rounded-full border-4 border-white object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900">{author.name}</h3>
                  <p className="text-sm text-indigo-600 font-medium">{author.genre || "No genre"}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {author.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      author.is_approved
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {author.is_approved ? "Approved" : "Pending"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(author.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {!author.is_approved && (
                      <button
                        onClick={() => handleApprove(author.id)}
                        className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(author.id)}
                      className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
