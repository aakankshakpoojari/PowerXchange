import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CATEGORIES = [
  "Textbook", "Reference Book", "Novel", "Guide", "Manual", "Other"
];

// Exported for use in other components
export const GENRES = [
  "Fiction", "Non-Fiction", "Science", "Mathematics", "Engineering",
  "Medicine", "History", "Philosophy", "Economics", "Computer Science",
  "Literature", "Self-Help", "Biography", "Law", "Art and Design",
];

const POPULAR_AUTHORS = [
  { name: "H.C. Verma",        field: "Physics",       wiki: "https://en.wikipedia.org/wiki/Harish_Chandra_Verma" },
  { name: "R.D. Sharma",       field: "Mathematics",   wiki: "https://en.wikipedia.org/wiki/R._D._Sharma" },
  { name: "Morrison Boyd",     field: "Chemistry",     wiki: "https://en.wikipedia.org/wiki/Robert_Thornton_Morrison" },
  { name: "Cormen et al.",     field: "Algorithms",    wiki: "https://en.wikipedia.org/wiki/Introduction_to_Algorithms" },
  { name: "Robert C. Martin",  field: "Software",      wiki: "https://en.wikipedia.org/wiki/Robert_C._Martin" },
  { name: "Alex Xu",           field: "System Design", wiki: "https://www.amazon.in/s?k=alex+xu" },
  { name: "N. Gregory Mankiw", field: "Economics",     wiki: "https://en.wikipedia.org/wiki/N._Gregory_Mankiw" },
  { name: "Jane Reece",        field: "Biology",       wiki: "https://en.wikipedia.org/wiki/Jane_B._Reece" },
];

const CONDITIONS = ["Brand New", "Like New", "Good Condition", "Old Copies"];

export default function SellBook({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", author: "", genre: "", condition: "",
    price: "", description: "", name: "", phone: "",
    email: "", address: "", city: "", pincode: "",
    quantity: "1",
  });

  const [dbGenres, setDbGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreInput, setGenreInput] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [authorQuery, setAuthorQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authorExists, setAuthorExists] = useState(null);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorDetails, setAuthorDetails] = useState({
    photo: "",
    description: "",
    genre: "",
  });
  const [authorPhotoFile, setAuthorPhotoFile] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState(null);
  const authorPhotoRef = useRef(null);

  const filteredAuthors = POPULAR_AUTHORS.filter(
    (a) => authorQuery.length > 0 && a.name.toLowerCase().includes(authorQuery.toLowerCase())
  );

  const handleImageChange = (file) => {
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageChange(file);
  };

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author);
    setForm({ ...form, author: author.name });
    setAuthorQuery(author.name);
    setShowDropdown(false);
  };

  // Function to refresh genres list
  const fetchGenres = async () => {
    const { supabase } = await import("../supabase");

    console.log("Fetching genres...");

    // Try fetching from genres table first (if it exists)
    const { data: genreData, error: genreError } = await supabase
      .from("genres")
      .select("name")
      .order("name");

    if (!genreError && genreData && genreData.length > 0) {
      console.log("Got genres from genres table:", genreData);
      const dbGenreNames = genreData.map(g => g.name);
      const allGenres = [...new Set([...dbGenreNames, ...GENRES])];
      setDbGenres(allGenres);
      return;
    }

    console.log("Genres table not available, fetching from books...");

    // Fallback: fetch unique genres from books (includes unapproved)
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("genre")
      .not("genre", "is", null)
      .neq("genre", "");

    if (booksError) {
      console.error("Error fetching genres from books:", booksError);
    }

    if (!booksError && booksData) {
      console.log("Got genres from books:", booksData);
      const dbGenreNames = [...new Set(booksData.map(b => b.genre).filter(g => g))];
      console.log("Unique genres:", dbGenreNames);
      const allGenres = [...new Set([...dbGenreNames, ...GENRES])];
      console.log("All genres combined:", allGenres);
      setDbGenres(allGenres);
    } else {
      // Final fallback to hardcoded
      console.log("Using hardcoded genres");
      setDbGenres(GENRES);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setImagePreview(null);
    setSelectedAuthor(null);
    setAuthorQuery("");
    setGenreInput("");
    setForm({ title: "", author: "", genre: "", condition: "", price: "", description: "", name: "", phone: "", email: "", address: "", city: "", pincode: "", quantity: "1" });
    // Refresh genres list to include newly added genres
    fetchGenres();
  };

  // Refresh genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Debug: log when form.genre changes
  useEffect(() => {
    console.log("Current genre in form:", form.genre);
  }, [form.genre]);

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `book_images/${fileName}`;

    console.log("Starting upload:", { fileName, filePath, fileSize: file.size, fileType: file.type });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful:", uploadData);

    const { data: { publicUrl } } = supabase.storage
      .from('book-images')
      .getPublicUrl(filePath);

    console.log("Public URL:", publicUrl);
    return publicUrl;
  };

  const handleAuthorCheck = async () => {
    if (!form.author.trim()) {
      alert("Please enter an author name");
      return;
    }

    setSubmitting(true);

    // Check if author already exists (case-insensitive)
    const { data: existingAuthors } = await supabase
      .from("authors")
      .select("id, name")
      .ilike("name", form.author.trim());

    const existingAuthor = existingAuthors?.[0] || null;

    if (existingAuthor) {
      // Author exists - just submit book with existing author name
      await submitBookWithAuthor(existingAuthor.id);
    } else {
      // Author doesn't exist - show modal to create new author
      setShowAuthorModal(true);
    }

    setSubmitting(false);
  };

  const uploadAuthorPhoto = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `author_photos/${fileName}`;

    console.log("Starting author photo upload:", { fileName, filePath });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Author photo upload error:", uploadError);
      throw uploadError;
    }

    console.log("Author photo upload successful:", uploadData);

    const { data: { publicUrl } } = supabase.storage
      .from('book-images')
      .getPublicUrl(filePath);

    console.log("Author photo public URL:", publicUrl);
    return publicUrl;
  };

  const submitBookWithAuthor = async (authorId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to sell a book");
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      let image_url = null;
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        try {
          image_url = await uploadImage(fileInput.files[0]);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          alert(`Image upload failed: ${uploadErr.message}. Your book will be listed without an image.`);
          // Continue without image
        }
      }

      console.log("Submitting book with genre:", form.genre);

      const { data, error } = await supabase
        .from("books")
        .insert({
          seller_id: user.id,
          seller_name: form.name || profile?.full_name,
          seller_phone: form.phone,
          seller_email: form.email || profile?.email,
          seller_address: form.address,
          seller_city: form.city,
          seller_pincode: form.pincode,
          title: form.title,
          author: form.author,
          author_id: authorId,
          genre: form.genre,
          condition: form.condition,
          price: parseFloat(form.price) || 0,
          description: form.description,
          image_url: image_url,
          is_approved: false,
          is_available: true,
        });

      if (error) {
        console.error("Book insert error:", error);
        throw error;
      }

      console.log("Book submitted successfully!");

      // Trigger a storage event to notify other pages/tabs
      localStorage.setItem('new-book-added', Date.now().toString());
      localStorage.removeItem('new-book-added');

      setSubmitted(true);
    } catch (err) {
      alert("Error submitting book: " + err.message);
    }
  };

  const handleCreateAuthorAndBook = async () => {
    if (!authorDetails.description || !authorDetails.genre) {
      alert("Please fill in author description and genre");
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = null;
      if (authorPhotoFile) {
        try {
          photoUrl = await uploadAuthorPhoto(authorPhotoFile);
        } catch (uploadErr) {
          console.error("Author photo upload failed:", uploadErr);
          alert(`Author photo upload failed: ${uploadErr.message}. Continuing without photo.`);
          // Continue without photo
        }
      }

      // Check one more time in case author was created between steps
      const { data: recheckAuthors } = await supabase
        .from("authors")
        .select("id, name")
        .ilike("name", form.author.trim());

      const alreadyExists = recheckAuthors?.[0] || null;

      if (alreadyExists) {
        // Author was already created - just use it
        setShowAuthorModal(false);
        await submitBookWithAuthor(alreadyExists.id);
        return;
      }

      // Safe to create new author
      const { data: newAuthor, error: authorError } = await supabase
        .from("authors")
        .insert({
          name: form.author.trim(),
          photo_url: photoUrl,
          description: authorDetails.description,
          genre: authorDetails.genre,
        })
        .select("id")
        .single();

      if (authorError) {
        // Last resort: if duplicate key, fetch the existing one and proceed
        if (authorError.message.includes("duplicate key") || authorError.message.includes("unique constraint")) {
          const { data: fallback } = await supabase
            .from("authors")
            .select("id")
            .ilike("name", form.author.trim())
            .limit(1)
            .single();
          if (fallback) {
            setShowAuthorModal(false);
            await submitBookWithAuthor(fallback.id);
            return;
          }
        }
        throw authorError;
      }

      setShowAuthorModal(false);
      await submitBookWithAuthor(newAuthor.id);
    } catch (err) {
      alert("Error creating author: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.genre || !form.condition || !form.price) {
      alert("Please fill in all required fields");
      return;
    }

    await handleAuthorCheck();
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition";
  const labelClass = "text-xs text-gray-500 block mb-1.5";

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
    <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Listing Submitted!</h2>
          <p className="text-gray-500 text-sm">Your book has been listed on PowerXchange.</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate("/home")}
              className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
            >
              Go Home
            </button>
            <button
              onClick={resetForm}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition"
            >
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Author Modal
  if (showAuthorModal) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl mx-auto mb-3">
                ✍️
              </div>
              <h2 className="text-2xl font-bold text-gray-900">New Author Found!</h2>
              <p className="text-gray-500 text-sm mt-2">
                <strong>{form.author}</strong> is not in our database yet.
              </p>
              <p className="text-gray-500 text-sm">
                Add details to create this author. Your book will be listed after admin approval.
              </p>
            </div>

            <div className="space-y-4">
              {/* Author Photo */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Author Photo (optional)</label>
                <div
                  onClick={() => authorPhotoRef.current?.click()}
                  className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                >
                  {authorPhotoPreview ? (
                    <img src={authorPhotoPreview} alt="Author Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mx-auto mb-1">
                        👤
                      </div>
                      <p className="text-xs font-medium text-gray-600">Click to upload author photo</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                </div>
                {authorPhotoPreview && (
                  <button
                    type="button"
                    onClick={() => { setAuthorPhotoPreview(null); setAuthorPhotoFile(null); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Remove photo
                  </button>
                )}
                <input
                  ref={authorPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAuthorPhotoFile(file);
                      setAuthorPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {/* Author Genre */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Author's Genre/Field</label>
                <input
                  type="text"
                  placeholder="e.g., Fiction, Science, Mathematics"
                  value={authorDetails.genre}
                  onChange={(e) => setAuthorDetails({ ...authorDetails, genre: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Author Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">About the Author</label>
                <textarea
                  rows={3}
                  placeholder="Brief description about the author..."
                  value={authorDetails.description}
                  onChange={(e) => setAuthorDetails({ ...authorDetails, description: e.target.value })}
                  className={inputClass + " resize-none"}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAuthorAndBook}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Author & Submit"}
                </button>
                <button
                  onClick={() => { setShowAuthorModal(false); setAuthorExists(null); }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
      <div className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            List a <span className="text-blue-600">Book</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below to list your book for sale or exchange.
          </p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Image Upload */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">
              Book Image
            </h2>
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={[
                "relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                "flex flex-col items-center justify-center gap-3",
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50",
                imagePreview ? "h-56" : "h-44",
              ].join(" ")}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mx-auto mb-2">
                    📷
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                onClick={() => setImagePreview(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-600 transition"
              >
                Remove image
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
          </section>

          {/* Book Details */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">
              Book Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className={labelClass}>Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Algorithms"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 relative">
                <label className={labelClass}>Author</label>
                <input
                  type="text"
                  placeholder="Search or type author name"
                  value={authorQuery}
                  onChange={(e) => {
                    setAuthorQuery(e.target.value);
                    setForm({ ...form, author: e.target.value });
                    setSelectedAuthor(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className={inputClass}
                />

                {showDropdown && filteredAuthors.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredAuthors.map((author) => (
                      <button
                        key={author.name}
                        onMouseDown={() => handleAuthorSelect(author)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {author.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{author.name}</p>
                          <p className="text-xs text-gray-400">{author.field}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedAuthor && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Author page:</span>
                    
                      <a href={selectedAuthor.wiki}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full hover:bg-blue-100 hover:border-blue-400 transition"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                        {selectedAuthor.name[0]}
                      </span>
                      <span>{selectedAuthor.name}</span>
                      <span className="text-blue-400">↗</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 relative">
                <label className={labelClass}>Genre</label>
                <input
                  type="text"
                  placeholder="Select or type new genre"
                  value={genreInput || form.genre}
                  onChange={(e) => {
                    setGenreInput(e.target.value);
                    setForm({ ...form, genre: e.target.value });
                  }}
                  onFocus={() => setShowGenreDropdown(true)}
                  onBlur={() => setTimeout(() => setShowGenreDropdown(false), 200)}
                  className={inputClass}
                  required
                />

                {showGenreDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {dbGenres
                      .filter((g) => genreInput.length === 0 || g.toLowerCase().includes(genreInput.toLowerCase()))
                      .length > 0 ? (
                      // Show matching genres
                      dbGenres
                        .filter((g) => genreInput.length === 0 || g.toLowerCase().includes(genreInput.toLowerCase()))
                        .map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onMouseDown={() => {
                              setForm({ ...form, genre });
                              setGenreInput(genre);
                              setShowGenreDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                              {genre[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{genre}</p>
                            </div>
                          </button>
                        ))
                    ) : genreInput.length > 0 ? (
                      // No matches - show message that user can create new genre
                      <div className="px-4 py-3 text-sm text-gray-500">
                        <p className="font-medium text-blue-600">"{genreInput}"</p>
                        <p>Will be added as a new genre when you submit the book</p>
                      </div>
                    ) : (
                      // No genres at all
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No genres found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Condition</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, condition: c })}
                      className={[
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition",
                        form.condition === c
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Any notes about the book - edition, missing pages, highlights, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass + " resize-none"}
                />
              </div>

            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">
              Pricing & Stock
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Asking Price (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Set to 0 for exchange only.</p>
              </div>

              <div>
                <label className={labelClass}>Quantity Available</label>
                <input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                />
                <p className="text-xs text-gray-400 mt-1.5">Set to 0 for out of stock.</p>
              </div>
            </div>
          </section>

          {/* Seller Details */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">
              Seller Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Street Address</label>
                <input
                  type="text"
                  placeholder="House no, Street, Locality"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  placeholder="e.g. Mangaluru"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>PIN Code</label>
                <input
                  type="text"
                  placeholder="575001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-bold px-8 py-3 rounded-full shadow-md shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Listing"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm border border-gray-300 rounded-full px-6 py-3 hover:bg-gray-50 transition text-gray-600"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}