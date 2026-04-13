import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AdminBooks() {
  const navigate = useNavigate(); // ✅ added

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, approved, pending
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  async function fetchBooks() {
    setLoading(true);

    let query = supabase.from("books").select("*");

    if (filter === "approved") {
      query = query.eq("is_approved", true);
    } else if (filter === "pending") {
      query = query.eq("is_approved", false);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching books:", error);
      alert("Error loading books: " + error.message);
    } else {
      console.log("Fetched books:", data);
      setBooks(data || []);
    }
    setLoading(false);
  }

  async function handleApprove(bookId, isApproved) {
    setActionLoading(true);
    const { error } = await supabase
      .from("books")
      .update({ is_approved: !isApproved })
      .eq("id", bookId);

    if (!error) {
      fetchBooks();
    }
    setActionLoading(false);
  }

  async function handleDelete(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setActionLoading(true);
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (!error) {
      fetchBooks();
      setShowModal(false);
      setSelectedBook(null);
    }
    setActionLoading(false);
  }

  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link to="/admin" className="text-indigo-200 hover:text-white">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl font-bold">Book Management</h1>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); navigate("/"); }}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "approved"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "pending"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-64"
          />
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              No books found
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-indigo-600">
                      {book.price === 0 ? "Free" : `₹${book.price}`}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      book.is_approved
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {book.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    <p>Seller: {book.profiles?.full_name || book.seller_name || "Unknown"}</p>
                    <p>College: {book.profiles?.college || "N/A"}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Condition: {book.condition} | Category: {book.category}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(book.id, book.is_approved)}
                      disabled={actionLoading}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                        book.is_approved
                          ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {book.is_approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => { setSelectedBook(book); setShowModal(true); }}
                      className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
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

      {/* Delete Confirmation Modal */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Book</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedBook.title}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setSelectedBook(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedBook.id)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}