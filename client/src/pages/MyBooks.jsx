import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Edit2, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function MyBooks({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ genre: "", condition: "", price: "", is_available: true, image_url: "" });
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

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

  const GENRES = ["Fiction","Non-Fiction","Science","Technology","Mathematics","History","Biography","Self-Help","Business","Arts","Comics","Other"];
  const CONDITIONS = ["new","good","acceptable"];
  const CONDITION_LABELS = { new: "New", good: "Good", acceptable: "Acceptable" };

  const handleEditDetails = (book) => {
    setEditingBook(book.id);
    setEditForm({
      genre: book.genre || "",
      condition: book.condition || "",
      price: book.price?.toString() || "0",
      is_available: book.is_available !== false,
      image_url: book.image_url || "",
    });
    setImagePreview(book.image_url || null);
  };

  const handleSaveDetails = async (bookId) => {
    setUpdating(true);
    try {
      let newImageUrl = editForm.image_url;

      // Check if there's a new image file to upload
      const imageInput = imageInputRef.current;
      if (imageInput?.files?.[0]) {
        setUploadingImage(true);
        try {
          newImageUrl = await uploadImage(imageInput.files[0]);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          alert(`Image upload failed: ${uploadErr.message}. Continuing without new image.`);
        }
        setUploadingImage(false);
      }

      const { error } = await supabase
        .from("books")
        .update({
          genre: editForm.genre,
          condition: editForm.condition,
          price: parseFloat(editForm.price) || 0,
          is_available: editForm.is_available,
          image_url: newImageUrl,
        })
        .eq("id", bookId);

      if (error) {
        alert("Error updating book: " + error.message);
      } else {
        setSuccessMessage("Book details updated successfully");
        setBooks(books.map(b => b.id === bookId ? {
          ...b,
          genre: editForm.genre,
          condition: editForm.condition,
          price: parseFloat(editForm.price) || 0,
          is_available: editForm.is_available,
          image_url: newImageUrl,
        } : b));
        setEditingBook(null);
        setImagePreview(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      alert("Error updating book: " + err.message);
    }
    setUpdating(false);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setEditForm({ genre: "", condition: "", price: "", is_available: true, image_url: "" });
    setImagePreview(null);
  };

  const handleImageChange = (file) => {
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `book_images/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('book-images')
      .getPublicUrl(filePath);

    return publicUrl;
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

  const getStatusBadge = (book) => {
    if (!book.is_available) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <XCircle size={12} />
          Not Available
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <CheckCircle size={12} />
        Available
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
              {books.filter(b => b.is_available).length}
            </p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">
              {books.filter(b => b.is_approved).length}
            </p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-red-600">
              {books.filter(b => !b.is_available).length}
            </p>
            <p className="text-sm text-gray-500">Not Available</p>
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

                    {/* Inline Edit Panel */}
                    {editingBook === book.id ? (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                        {/* Image Upload */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1 font-medium">Book Image</label>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://placehold.co/80x112?text=No+Cover";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                                  📖
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e.target.files[0])}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                              >
                                {imagePreview ? "Change Image" : "Upload Image"}
                              </button>
                              {imagePreview && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview(null);
                                    if (imageInputRef.current) imageInputRef.current.value = "";
                                  }}
                                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              )}
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1 font-medium">Genre</label>
                            <select
                              value={editForm.genre}
                              onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            >
                              <option value="">Select genre</option>
                              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1 font-medium">Condition</label>
                            <select
                              value={editForm.condition}
                              onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            >
                              <option value="">Select condition</option>
                              {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1 font-medium">Price (Rs.)</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Set to 0 for exchange only</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 font-medium">Availability:</label>
                          <button
                            onClick={() => setEditForm({ ...editForm, is_available: !editForm.is_available })}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                              editForm.is_available
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                          >
                            {editForm.is_available ? "✓ Available" : "✗ Not Available"}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveDetails(book.id)}
                            disabled={updating || uploadingImage}
                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {uploadingImage ? "Uploading..." : updating ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditDetails(book)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 inline-flex items-center gap-1"
                      >
                        <Edit2 size={11} /> Edit details
                      </button>
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