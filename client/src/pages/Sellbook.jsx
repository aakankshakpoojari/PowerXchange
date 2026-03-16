import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const GENRES = [
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

const CONDITIONS = ["Like New", "Good", "Fair", "Worn"];

export default function SellBook() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", author: "", genre: "", condition: "",
    price: "", description: "", name: "", phone: "",
    email: "", address: "", city: "", pincode: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [authorQuery, setAuthorQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  const resetForm = () => {
    setSubmitted(false);
    setImagePreview(null);
    setSelectedAuthor(null);
    setAuthorQuery("");
    setForm({ title: "", author: "", genre: "", condition: "", price: "", description: "", name: "", phone: "", email: "", address: "", city: "", pincode: "" });
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition";
  const labelClass = "text-xs text-gray-500 block mb-1.5";

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
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

              <div>
                <label className={labelClass}>Genre</label>
                <select
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select genre</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
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
              Pricing
            </h2>
            <div className="max-w-xs">
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
          </section>

          {/* Contact and Address */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-4">
              Contact and Address
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
              onClick={() => setSubmitted(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white text-sm font-bold px-8 py-3 rounded-full shadow-md shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transition-all duration-200"
            >
              Submit Listing
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
    </div>
  );
}