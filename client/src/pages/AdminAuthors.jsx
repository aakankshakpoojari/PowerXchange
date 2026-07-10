import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AdminAuthors() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", genre: "", description: "", photo_url: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  async function handleDisapprove(authorId) {
    const { error } = await supabase
      .from("authors")
      .update({ is_approved: false })
      .eq("id", authorId);

    if (!error) {
      alert("Author disapproved successfully!");
      fetchAuthors();
    } else {
      alert("Error disapproving author: " + error.message);
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

  function handleEdit(author) {
    setEditingAuthor(author);
    setEditForm({
      name: author.name || "",
      genre: author.genre || "",
      description: author.description || "",
      photo_url: author.photo_url || "",
    });
    setPhotoFile(null);
    setPhotoPreview(author.photo_url || null);
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    if (!editingAuthor) return;
    setSaving(true);

    let photoUrl = editForm.photo_url;

    // Upload new photo if selected
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `authors/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, photoFile, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      } catch (err) {
        alert("Error uploading photo: " + err.message);
        setUploadingPhoto(false);
        setSaving(false);
        return;
      }
      setUploadingPhoto(false);
    }

    const { error } = await supabase
      .from("authors")
      .update({
        name: editForm.name,
        genre: editForm.genre,
        description: editForm.description,
        photo_url: photoUrl,
      })
      .eq("id", editingAuthor.id);

    setSaving(false);

    if (!error) {
      alert("Author updated successfully!");
      setShowEditModal(false);
      setEditingAuthor(null);
      fetchAuthors();
    } else {
      alert("Error updating author: " + error.message);
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
              <h1 className="text-2xl font-bold">Author Management</h1>
              <p className="text-indigo-200 text-sm">Approve or edit author profiles</p>
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
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(author)}
                      className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Edit
                    </button>
                    {!author.is_approved ? (
                      <button
                        onClick={() => handleApprove(author.id)}
                        className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDisapprove(author.id)}
                        className="flex-1 px-3 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                      >
                        Disapprove
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

      {/* Edit Author Modal */}
      {showEditModal && editingAuthor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Edit Author</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingAuthor(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <input
                  type="text"
                  value={editForm.genre}
                  onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="e.g., Fiction, Science, History"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={4}
                  placeholder="Brief description about the author"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div
                  onClick={() => document.getElementById("author-photo-input").click()}
                  className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-full w-full object-contain rounded-xl p-2"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl mx-auto mb-1">📷</div>
                      <p className="text-xs font-medium text-gray-600">Click to upload photo</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Remove photo
                  </button>
                )}
                <input
                  id="author-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={saving || uploadingPhoto}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
              >
                {uploadingPhoto ? "Uploading photo..." : saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => { setShowEditModal(false); setEditingAuthor(null); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
