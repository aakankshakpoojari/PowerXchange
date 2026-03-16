import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const listedBooks = [
  { id: 1, title: "H.C. Verma Vol. 1", author: "H.C. Verma", subject: "Physics", status: "available", color: "bg-blue-100 text-blue-700", price: 180, condition: "Good", seller: "Aakanksha Poojari" },
  { id: 2, title: "R.D. Sharma Class 12", author: "R.D. Sharma", subject: "Maths", status: "available", color: "bg-green-100 text-green-700", price: 220, condition: "Like New", seller: "Aakanksha Poojari" },
  { id: 3, title: "Organic Chemistry", author: "Morrison & Boyd", subject: "Chem", status: "on hold", color: "bg-amber-100 text-amber-700", price: 150, condition: "Fair", seller: "Aakanksha Poojari" },
  { id: 4, title: "CLRS Algorithms", author: "Cormen et al.", subject: "CS", status: "available", color: "bg-purple-100 text-purple-700", price: 300, condition: "Good", seller: "Aakanksha Poojari" },
  { id: 5, title: "Campbell Biology", author: "Jane Reece", subject: "Biology", status: "available", color: "bg-red-100 text-red-600", price: 200, condition: "Like New", seller: "Aakanksha Poojari" },
  { id: 6, title: "Microeconomics", author: "N. Gregory Mankiw", subject: "Econ", status: "sold", color: "bg-teal-100 text-teal-700", price: 120, condition: "Fair", seller: "Aakanksha Poojari" },
];

const wishlistBooks = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", price: 250, condition: "Good", seller: "Rahul Shetty", olid: "OL7353617M" },
  { id: 2, title: "The Pragmatic Programmer", author: "Hunt & Thomas", price: 200, condition: "Like New", seller: "Priya Nair", olid: "OL7353490M" },
  { id: 3, title: "Discrete Mathematics", author: "Kenneth Rosen", price: 180, condition: "Fair", seller: "Kiran Bhat", olid: "OL24295682M" },
  { id: 4, title: "System Design Interview", author: "Alex Xu", price: 300, condition: "Good", seller: "Deepak Kamath", olid: "OL32125489M" },
];

const history = [
  { id: 1, type: "exchange", title: "Data Structures in C", with: "Rahul Shetty", date: "Mar 10, 2025" },
  { id: 2, type: "bought", title: "Operating Systems Concepts", with: "Priya Nair · ₹180", date: "Feb 28, 2025" },
  { id: 3, type: "sold", title: "Microeconomics", with: "Kiran Bhat · ₹220", date: "Feb 14, 2025" },
  { id: 4, type: "exchange", title: "JEE Physics Problems", with: "Deepak Kamath", date: "Jan 30, 2025" },
];

const statusStyles = {
  available: "bg-green-100 text-green-700",
  "on hold": "bg-amber-100 text-amber-700",
  sold: "bg-blue-100 text-blue-700",
};

const historyIcon = { exchange: "⇄", bought: "↓", sold: "↑" };
const historyBg   = { exchange: "bg-green-100", bought: "bg-blue-100", sold: "bg-amber-100" };

function BookCover({ olid, title }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
  if (!imgError) {
    return (
      <img src={coverUrl} alt={title} onError={() => setImgError(true)}
        className="w-12 h-16 rounded-lg object-cover shrink-0 shadow-sm border border-gray-100" />
    );
  }
  return (
    <div className="w-12 h-16 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 shadow-sm border border-purple-200">
      <span className="text-purple-500 font-bold text-lg">{title[0]}</span>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listed");
  const [wishlist, setWishlist] = useState(wishlistBooks);

  const initialForm = {
    name: "Aakanksha Poojari",
    email: "aakanksha@email.com",
    college: "NITK Surathkal",
    location: "Mangaluru, KA",
    bio: "Loves books, hates paying full price for them.",
  };

  const [form, setForm]   = useState(initialForm);
  const [draft, setDraft] = useState(initialForm);

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar isProfile={true} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile Hero */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-medium shrink-0">
            AK
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">{form.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{form.email} · {form.location}</p>
            <div className="flex gap-5 mt-2">
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">6</span> listed</span>
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">3</span> exchanged</span>
              <span className="text-sm text-gray-500"><span className="font-medium text-gray-900">{wishlist.length}</span> wishlist</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            {/* ── NEW: Sell a Book shortcut ── */}
            <button
              onClick={() => navigate("/sellbook")}
              className="text-sm bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold rounded-lg px-4 py-2 hover:scale-105 transition shadow-sm shadow-blue-200"
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
            {listedBooks.map((book) => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col">
                <div className={`w-full h-20 rounded-lg flex items-center justify-center text-xs font-medium mb-3 ${book.color}`}>
                  {book.subject}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-md ${statusStyles[book.status]}`}>
                  {book.status}
                </span>
                {book.status === "available" && (
                  <button onClick={() => handleBuy(book)}
                    className="mt-3 w-full bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition">
                    Buy Book
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === "wishlist" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wishlist.map((book) => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                <BookCover olid={book.olid} title={book.title} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">₹{book.price}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <button onClick={() => handleBuy(book)}
                    className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                    Buy Book
                  </button>
                  <button onClick={() => setWishlist(wishlist.filter((b) => b.id !== book.id))}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${historyBg[item.type]}`}>
                  {historyIcon[item.type]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} · {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.type === "exchange" ? "With" : item.type === "bought" ? "From" : "To"} {item.with}
                  </p>
                </div>
                <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Edit Profile */}
        {activeTab === "edit" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg">
            {[
              { label: "Full name",            key: "name",     type: "text"  },
              { label: "Email",                key: "email",    type: "email" },
              { label: "College / Institution",key: "college",  type: "text"  },
              { label: "Location",             key: "location", type: "text"  },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-5">
                <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
                <input type={type} value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
            ))}
            <div className="mb-5">
              <label className="text-xs text-gray-500 block mb-1.5">Bio</label>
              <textarea rows={3} value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setForm(draft)}
                className="bg-gray-900 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                Save changes
              </button>
              <button onClick={() => setDraft(form)}
                className="text-sm border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 transition">
                Discard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}