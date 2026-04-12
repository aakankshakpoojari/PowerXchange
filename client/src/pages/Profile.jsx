import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";


const statusStyles = {
  available: "bg-green-100 text-green-700",
  "on hold": "bg-amber-100 text-amber-700",
  sold: "bg-blue-100 text-blue-700",
};

const historyIcon = { exchange: "⇄", bought: "↓", sold: "↑" };
const historyBg = { exchange: "bg-green-100", bought: "bg-blue-100", sold: "bg-amber-100" };

export default function Profile({ isLoggedIn, onLogout, cart }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listed");
  const [wishlist, setWishlist] = useState([]);
  const [listedBooks, setListedBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ listed: 0, exchanged: 0, wishlist: 0 });

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
  });
  const [draft, setDraft] = useState(form);
  const [userId, setUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch user profile and data from database
  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      setUserId(user.id);

      // Fetch profile from database
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const userData = {
          name: profileData.full_name || user.user_metadata?.full_name || "User",
          email: profileData.email || user.email || "",
          college: profileData.college || user.user_metadata?.college || "",
        };
        setForm(userData);
        setDraft(userData);
      }

      // Fetch user's listed books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      setListedBooks(booksData || []);

      // Fetch wishlist (table might not exist yet)
      let wishlistData = [];
      const { data: wd, error: we } = await supabase
        .from("wishlist")
        .select("*, books(*)")
        .eq("user_id", user.id);
      if (!we && wd) {
        wishlistData = wd;
        setWishlist(wd.map(w => ({ ...w.books, wishlistId: w.id })) || []);
      } else {
        setWishlist([]);
      }

      // Fetch transaction history (table might not exist yet)
      let historyData = [];
      const { data: td, error: te } = await supabase
        .from("transactions")
        .select("*, books(title), buyer:buyer_id(full_name), seller:seller_id(full_name)")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (!te && td) {
        historyData = td.map(t => ({
          id: t.id,
          type: t.status === "completed" ? "sold" : "exchange",
          title: t.books?.title || "Book",
          with: t.buyer_id === user.id
            ? `From ${t.seller?.full_name || "User"}`
            : `To ${t.buyer?.full_name || "User"}`,
          date: new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          price: t.price
        }));
        setHistory(historyData);
      } else {
        setHistory([]);
      }

      setStats({
        listed: booksData?.length || 0,
        exchanged: historyData.length || 0,
        wishlist: wishlistData?.length || 0
      });
    };

    loadProfileData();
  }, []);

  const tabs = [
    { key: "listed",   label: "My listed books" },
    { key: "wishlist", label: "Wishlist"         },
    { key: "history",  label: "History"          },
    { key: "edit",     label: "Edit profile"     },
  ];

  const handleTabChange = (tab) => {
    if (tab === "edit") setDraft(form);
    setActiveTab(tab);
  };

  const handleBuy = (book) => navigate("/buybook", { state: { book } });

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage("");

    const { data: { session } } = await supabase.auth.getSession();
    const uid = userId || session?.user?.id;

    if (!uid) {
      setSaveMessage("Error saving profile");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: draft.name,
        college: draft.college,
      })
      .eq("id", uid);

    if (error) {
      console.error("Profile save error:", error);
      setSaveMessage("Error saving profile: " + error.message);
    } else {
      setForm(draft);
      setSaveMessage("Profile saved successfully!");
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile Hero */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-medium shrink-0">
            {form.name ? form.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{form.name || "Loading..."}</p>
            <p className="text-sm text-gray-500 mt-0.5">{form.email}</p>
            <div className="flex gap-5 mt-2">
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">{stats.listed}</span> listed</span>
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">{stats.exchanged}</span> exchanged</span>
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">{stats.wishlist}</span> wishlist</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => navigate("/my-books")}
              className="text-sm bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold rounded-lg px-4 py-2 hover:scale-105 transition shadow-sm shadow-blue-200"
            >
              Manage My Books
            </button>
            <button
              onClick={() => navigate("/sellbook")}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
            >
              + Sell a Book
            </button>
            <button
              onClick={() => handleTabChange("edit")}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-2.5 text-sm border-b-2 transition ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Listed Books */}
        {activeTab === "listed" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {listedBooks.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">No books listed yet</div>
            ) : (
              listedBooks.map((book) => (
                <div key={book.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col">
                  <div className={`w-full h-20 rounded-lg flex items-center justify-center text-xs font-medium mb-3 bg-indigo-100 text-indigo-700`}>
                    {book.genre || book.category || "Book"}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Stock: {(book.quantity || 0)}</span>
                    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-md ${
                      !book.is_available || (book.quantity || 0) === 0
                        ? "bg-red-100 text-red-700"
                        : book.quantity <= 3
                        ? "bg-amber-100 text-amber-700"
                        : statusStyles.available
                    }`}>
                      {!book.is_available || (book.quantity || 0) === 0 ? "Out of stock" : book.quantity <= 3 ? "Low stock" : "Available"}
                    </span>
                  </div>
                  {book.is_available && (book.quantity || 0) > 0 && (
                    <button onClick={() => handleBuy(book)}
                      className="mt-3 w-full bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition">
                      Buy Book
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === "wishlist" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wishlist.length === 0 ? (
              <div className="text-center text-gray-500 py-8 col-span-full">No books in wishlist</div>
            ) : (
              wishlist.map((book, idx) => (
                <div key={book.wishlistId || book.id || `wishlist-${idx}`} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-16 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 shadow-sm border border-purple-200">
                    <span className="text-purple-500 font-bold text-lg">{book.title?.[0] || "B"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title || "Unknown Book"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{book.author || "Unknown"}</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-1">₹{book.price || "N/A"}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <button onClick={() => handleBuy(book)}
                      className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                      Buy Book
                    </button>
                    <button
                      onClick={async () => {
                        await supabase.from("wishlist").delete().eq("id", book.wishlistId);
                        setWishlist(wishlist.filter((b) => b.wishlistId !== book.wishlistId));
                      }}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No transaction history yet</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${historyBg[item.type]}`}>
                    {historyIcon[item.type]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} · {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.with} {item.price ? `· ₹${item.price}` : ""}
                    </p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Edit Profile */}
        {activeTab === "edit" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg">
            {saveMessage && (
              <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${
                saveMessage.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}>
                {saveMessage}
              </div>
            )}
            {[
              { label: "Full name",             key: "name",    type: "text"  },
              { label: "Email",                 key: "email",   type: "email", disabled: true },
              { label: "College / Institution", key: "college", type: "text"  },
            ].map(({ label, key, type, disabled }) => (
              <div key={key} className="mb-5">
                <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
                <input
                  type={type}
                  value={draft[key]}
                  readOnly={disabled}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 ${
                    disabled ? "bg-gray-100 text-gray-500" : "bg-gray-50"
                  }`}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-gray-900 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={() => setDraft(form)}
                className="text-sm border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}