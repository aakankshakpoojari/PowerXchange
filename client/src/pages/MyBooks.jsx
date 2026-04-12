import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Edit2, Trash2, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function MyBooks({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: 1, is_available: true });
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadUserBooks();
  }, []);

  const loadUserBooks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading books:", error);
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const handleToggleAvailability = async (book) => {
    setUpdating(true);
    const newAvailability = !book.is_available;

    const { error } = await supabase
      .from("books")
      .update({ is_available: newAvailability })
      .eq("id", book.id);

    if (error) {
      alert("Error updating availability: " + error.message);
    } else {
      setSuccessMessage(`Book marked as ${newAvailability ? "available" : "unavailable"}`);
      setBooks(books.map(b => b.id === book.id ? { ...b, is_available: newAvailability } : b));
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setUpdating(false);
  };

  const handleUpdateQuantity = async (book) => {
    setEditingBook(book.id);
    setEditForm({
      quantity: book.quantity || 1,
      is_available: book.is_available
    });
  };

  const handleSaveQuantity = async (bookId) => {
    setUpdating(true);

    // Auto set is_available to false if quantity is 0
    const newQuantity = Math.max(0, parseInt(editForm.quantity) || 0);
    const newAvailability = newQuantity > 0;

    const { error } = await supabase
      .from("books")
      .update({
        quantity: newQuantity,
        is_available: newAvailability
      })
      .eq("id", bookId);

    if (error) {
      alert("Error updating quantity: " + error.message);
    } else {
      setSuccessMessage(newQuantity === 0
        ? "Stock is now 0 - book marked as out of stock"
        : `Quantity updated to ${newQuantity}`
      );
      setBooks(books.map(b => b.id === bookId ? {
        ...b,
        quantity: newQuantity,
        is_available: newAvailability
      } : b));
      setEditingBook(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setUpdating(false);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setEditForm({ quantity: 1, is_available: true });
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book listing?")) {
      return;
    }

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (error) {
      alert("Error deleting book: " + error.message);
    } else {
      setSuccessMessage("Book listing deleted successfully");
      setBooks(books.filter(b => b.id !== bookId));
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleEditBook = (bookId) => {
    navigate(`/sellbook?edit=${bookId}`);
  };

  const getStatusBadge = (book) => {
    if (book.quantity === 0 || !book.is_available) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <XCircle size={12} />
          Out of Stock
        </span>
      );
    }
    if (book.quantity <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
          <AlertCircle size={12} />
          Low Stock ({book.quantity})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <CheckCircle size={12} />
        In Stock ({book.quantity})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading your books...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
            <p className="text-gray-500 mt-1">Manage your book listings and inventory</p>
          </div>
          <button
            onClick={() => navigate("/sellbook")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition shadow-lg shadow-blue-200"
          >
            + Add New Book
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            <p className="text-sm text-gray-500">Total Listings</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {books.filter(b => b.is_available && (b.quantity || 0) > 0).length}
            </p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">
              {books.filter(b => (b.quantity || 0) <= 3 && (b.quantity || 0) > 0).length}
            </p>
            <p className="text-sm text-gray-500">Low Stock</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-red-600">
              {books.filter(b => !b.is_available || (b.quantity || 0) === 0).length}
            </p>
            <p className="text-sm text-gray-500">Out of Stock</p>
          </div>
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No books listed yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start by listing your first book for sale or exchange</p>
            <button
              onClick={() => navigate("/sellbook")}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              List Your First Book
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Book Cover */}
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {book.image_url ? (
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/80x112?text=No+Cover";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        📖
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-500">by {book.author}</p>
                      </div>
                      {getStatusBadge(book)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Genre: {book.genre || "N/A"}</span>
                      <span>Condition: {book.condition || "N/A"}</span>
                      <span className="font-semibold text-gray-900">₹{book.price || 0}</span>
                    </div>

                    {/* Quantity Control */}
                    {editingBook === book.id ? (
                      <div className="flex items-center gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min="0"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex gap-2 mt-5">
                          <button
                            onClick={() => handleSaveQuantity(book.id)}
                            disabled={updating}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Stock: <span className={`font-medium ${(book.quantity || 0) === 0 ? 'text-red-600' : ''}`}>
                            {book.quantity || 0}
                          </span>
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(book)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/books/${book.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Book"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditBook(book.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Edit Book"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(book)}
                      disabled={updating}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${
                        book.is_available
                          ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      title={book.is_available ? "Mark Unavailable" : "Mark Available"}
                    >
                      {book.is_available ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Book"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
