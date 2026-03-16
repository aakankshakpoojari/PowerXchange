import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const genres = [
  { name: "Biography" }, { name: "Arts & Crafts" }, { name: "Business" },
  { name: "Comics" },    { name: "Cookery" },        { name: "History" },
  { name: "Kids" },      { name: "Science" },        { name: "Sports" },
  { name: "Travel" },    { name: "Fiction" },        { name: "Self Help" },
];

const authors = [
  { name: "Roald Dahl" },     { name: "Jeff Kinney" },
  { name: "Enid Blyton" },    { name: "Sudha Murthy" },
  { name: "Rick Riordan" },   { name: "J.K. Rowling" },
  { name: "Dan Brown" },      { name: "James Patterson" },
];

const trending = [
  { title: "Harry Potter & the Sorcerer's Stone", img: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg" },
  { title: "The Hobbit",                          img: "https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg" },
  { title: "Percy Jackson: Lightning Thief",      img: "https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg" },
  { title: "Diary of a Wimpy Kid",                img: "https://covers.openlibrary.org/b/isbn/9780810993136-M.jpg" },
  { title: "Charlie & the Chocolate Factory",     img: "https://covers.openlibrary.org/b/isbn/9780142410318-M.jpg" },
  { title: "The Very Hungry Caterpillar",         img: "https://covers.openlibrary.org/b/isbn/9780399226908-M.jpg" },
  { title: "Matilda",                             img: "https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg" },
];

const newArrivals = [
  { title: "Atomic Habits",     img: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg" },
  { title: "The Alchemist",     img: "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg" },
  { title: "Ikigai",            img: "https://covers.openlibrary.org/b/isbn/9780143130727-M.jpg" },
  { title: "Sapiens",           img: "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg" },
  { title: "Rich Dad Poor Dad", img: "https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg" },
  { title: "Deep Work",         img: "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg" },
  { title: "Think & Grow Rich", img: "https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg" },
  { title: "The 5 AM Club",     img: "https://covers.openlibrary.org/b/isbn/9781443456463-M.jpg" },
];

const kids = [
  { title: "Goodnight Moon",            img: "https://covers.openlibrary.org/b/isbn/9780064430173-M.jpg" },
  { title: "Where the Wild Things Are", img: "https://covers.openlibrary.org/b/isbn/9780064431781-M.jpg" },
  { title: "Green Eggs and Ham",        img: "https://covers.openlibrary.org/b/isbn/9780394800165-M.jpg" },
  { title: "The Cat in the Hat",        img: "https://covers.openlibrary.org/b/isbn/9780394800012-M.jpg" },
  { title: "Charlotte's Web",           img: "https://covers.openlibrary.org/b/isbn/9780064400558-M.jpg" },
  { title: "James & the Giant Peach",   img: "https://covers.openlibrary.org/b/isbn/9780142410363-M.jpg" },
  { title: "Fantastic Mr Fox",          img: "https://covers.openlibrary.org/b/isbn/9780142410349-M.jpg" },
  { title: "The BFG",                   img: "https://covers.openlibrary.org/b/isbn/9780142410387-M.jpg" },
];

const condition = [
  { title: "Brand New",      img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=220&fit=crop&auto=format" },
  { title: "Like New",       img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=220&fit=crop&auto=format" },
  { title: "Good Condition", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=220&fit=crop&auto=format" },
  { title: "Old Copies",     img: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=220&fit=crop&auto=format" },
];

/* ── Helpers ── */
function AccentBar() {
  return <span className="inline-block w-1 h-5 rounded-sm bg-gradient-to-b from-blue-600 to-cyan-400 flex-shrink-0" />;
}

function ArrowBtn({ side, onClick }) {
  return (
    <button onClick={onClick}
      className={`absolute ${side === "left" ? "left-0" : "right-0"} top-1/2 -translate-y-1/2
        z-10 w-9 h-9 rounded-full bg-white border border-blue-100 shadow-md
        text-blue-600 text-xl leading-none flex items-center justify-center
        hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200`}>
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

function ProgressBar({ pct = 30 }) {
  return (
    <div className="mt-3 h-0.5 bg-blue-100 rounded-full">
      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function RentBtn({ label = "Rent", onClick }) {
  return (
    <button onClick={onClick}
      className="border border-blue-600 text-blue-600 text-xs font-semibold
        rounded-full px-4 py-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-400
        hover:text-white hover:border-transparent transition-all duration-200">
      {label}
    </button>
  );
}

/* ── Hero ── */
function Hero({ onBrowse }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-400
      flex items-center justify-between px-16 py-20 min-h-[420px]">
      <div className="absolute -top-12 right-44 w-72 h-72 rounded-full bg-cyan-400/10 pointer-events-none" />
      <div className="absolute -bottom-16 left-80 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="max-w-lg z-10">
        <span className="inline-block bg-cyan-400/20 text-cyan-300 text-xs font-bold
          tracking-widest uppercase rounded-full px-4 py-1.5 mb-5">
          📖 India's Largest Book Exchange
        </span>
        <h1 className="font-serif font-black text-5xl text-white leading-tight mb-3">
          Give Your Books<br />
          <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
            a Second Life
          </span>
        </h1>
        <p className="text-white/70 text-base leading-relaxed mb-7">
          Exchange books with people around you and discover something new. Over 10 lakh titles waiting for you.
        </p>
        {/* ── navigates to /browse ── */}
        <button onClick={onBrowse}
          className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold
            px-8 py-3 rounded-xl shadow-[0_6px_22px_rgba(0,198,255,0.4)]
            hover:scale-105 transition-transform duration-200">
          Browse Books
        </button>
      </div>
      <div className="relative z-10">
        <img src="https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=760&h=560&fit=crop&auto=format"
          alt="Books"
          className="w-96 h-72 object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-2 border-white/15"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=760&h=560&fit=crop"; }} />
      </div>
    </section>
  );
}

/* ── Genre Strip ── */
function GenreStrip({ onGenreClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-10">
      <h2 className="text-center font-serif font-bold text-3xl text-blue-950 mb-6">Browse by Genre</h2>
      <div className="relative">
        <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-1">
          {genres.map((g, i) => (
            <div key={i} onClick={() => onGenreClick(g.name)}
              className="flex flex-col items-center min-w-[82px] cursor-pointer
                bg-white rounded-xl px-2.5 pt-3 pb-2.5 border border-blue-100
                shadow-sm hover:bg-blue-600 hover:border-blue-600
                hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-200
                transition-all duration-200 group">
              <p className="mt-2 text-center text-[11px] font-medium text-blue-900
                group-hover:text-white leading-tight">{g.name}</p>
            </div>
          ))}
        </div>
        <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left: 320, behavior: "smooth" })} />
      </div>
    </div>
  );
}

/* ── Book Grid Slider ── */
function BookGridSlider({ title, data, onBookClick }) {
  const [page, setPage] = useState(0);
  const perPage    = 7;
  const totalPages = Math.ceil(data.length / perPage);
  const chunk      = data.slice(page * perPage, page * perPage + perPage);
  const featured   = chunk[0];
  const grid       = chunk.slice(1, 7);

  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-lg text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div className="flex gap-3 items-stretch">
        {featured && (
          <div onClick={() => onBookClick(featured)}
            className="flex-shrink-0 w-48 rounded-xl overflow-hidden border border-blue-100
              shadow-md hover:-translate-y-1 hover:shadow-blue-200 transition-all duration-200 cursor-pointer">
            <img src={featured.img} alt={featured.title}
              className="w-full h-full min-h-[280px] object-cover"
              onError={(e) => { e.target.src = "https://via.placeholder.com/192x280/1d4ed8/ffffff?text=Book"; }} />
          </div>
        )}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => {
            const book = grid[i];
            if (!book) return <div key={i} className="bg-blue-50 rounded-xl border border-dashed border-blue-200" />;
            return (
              <div key={i} className="bg-white rounded-xl border border-blue-100 shadow-sm p-3
                flex gap-3 items-center hover:-translate-y-1 hover:shadow-md
                hover:shadow-blue-100 transition-all duration-200">
                <img src={book.img} alt={book.title}
                  className="w-14 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/56x80/1d4ed8/ffffff?text=Book"; }} />
                <div>
                  <p className="font-semibold text-xs text-blue-950 leading-snug mb-2">{book.title}</p>
                  {/* ── Rent → /buybook with book state ── */}
                  <RentBtn onClick={() => onBookClick(book)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 h-0.5 bg-blue-100 rounded-full">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
          style={{ width: `${100 / Math.max(totalPages, 1)}%`, marginLeft: `${page * (100 / Math.max(totalPages, 1))}%` }} />
      </div>
      {page > 0 && (
        <button onClick={() => setPage((p) => p - 1)}
          className="absolute left-7 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
            bg-white border border-blue-100 shadow-md text-blue-600 text-xl
            hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200
            flex items-center justify-center">‹</button>
      )}
      {page < totalPages - 1 && (
        <button onClick={() => setPage((p) => p + 1)}
          className="absolute right-7 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
            bg-white border border-blue-100 shadow-md text-blue-600 text-xl
            hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200
            flex items-center justify-center">›</button>
      )}
    </div>
  );
}

/* ── Book Row Slider ── */
function BookRowSlider({ title, data, onBookClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-lg text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {data.map((book, i) => (
          <div key={i} className="min-w-[240px] max-w-[240px] flex-shrink-0 bg-white rounded-xl
            border border-blue-100 shadow-sm p-3 flex gap-3 items-center
            hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100 transition-all duration-200">
            <img src={book.img} alt={book.title}
              className="w-[72px] h-24 object-cover rounded-lg flex-shrink-0 shadow-sm"
              onError={(e) => { e.target.src = "https://via.placeholder.com/72x96/1d4ed8/ffffff?text=Book"; }} />
            <div>
              <p className="font-semibold text-xs text-blue-950 leading-snug mb-2.5">{book.title}</p>
              <RentBtn onClick={() => onBookClick(book)} />
            </div>
          </div>
        ))}
      </div>
      <ProgressBar pct={30} />
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -420, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  420, behavior: "smooth" })} />
    </div>
  );
}

/* ── Condition Slider ── */
function ConditionSlider({ title, data, onConditionClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-lg text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {data.map((item, i) => (
          <div key={i} onClick={() => onConditionClick(item.title)}
            className="min-w-[210px] max-w-[210px] flex-shrink-0 bg-white rounded-xl
              border border-blue-100 overflow-hidden shadow-sm cursor-pointer
              hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100 transition-all duration-200">
            <img src={item.img} alt={item.title} className="w-full h-32 object-cover"
              onError={(e) => { e.target.src = `https://via.placeholder.com/210x128/1d4ed8/ffffff?text=${encodeURIComponent(item.title)}`; }} />
            <div className="p-3">
              <p className="font-semibold text-sm text-blue-950 mb-2">{item.title}</p>
              {/* ── Browse by condition → /browse?condition=xxx ── */}
              <RentBtn label="Browse" onClick={() => onConditionClick(item.title)} />
            </div>
          </div>
        ))}
      </div>
      <ProgressBar pct={100} />
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -400, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  400, behavior: "smooth" })} />
    </div>
  );
}

/* ── Author Slider ── */
function AuthorSlider({ onAuthorClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-6 relative">
      <div ref={ref} className="flex gap-7 overflow-x-auto scrollbar-hide py-2">
        {authors.map((a, i) => (
          <div key={i} onClick={() => onAuthorClick(a.name)}
            className="flex flex-col items-center min-w-[90px] cursor-pointer group">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=80&background=dbeafe&color=1d4ed8&bold=true`}
              alt={a.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-100
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=80&background=dbeafe&color=1d4ed8&bold=true`;
              }} />
            <p className="mt-2 text-center text-xs font-medium text-blue-900 leading-tight">{a.name}</p>
          </div>
        ))}
      </div>
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
    </div>
  );
}

/* ── Footer ── */
function Footer({ onFooterNav }) {
  const infoLinks = ["Privacy Policy", "Terms & Conditions", "Cancellation & Refund", "Shipping & Delivery", "Account Deletion"];
  const resourceLinks = ["FAQ", "Partner With Us", "Pricing", "Blog"];

  // map footer link labels to internal routes where applicable
  const routeMap = {
    "Privacy Policy":        "/privacy",
    "Terms & Conditions":    "/terms",
    "Cancellation & Refund": "/refund",
    "Shipping & Delivery":   "/shipping",
    "Account Deletion":      "/account-deletion",
    "FAQ":                   "/faq",
    "Partner With Us":       "/partner",
    "Pricing":               "/pricing",
    "Blog":                  "/blog",
  };

  return (
    <footer className="mt-16 bg-blue-950">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 py-3 flex justify-center">
        <p className="text-white font-bold text-sm tracking-wide">
          📚 Over 10 Lakh Books · 2 Lakh Happy Readers · Available Every Day
        </p>
      </div>
      <div className="grid grid-cols-3 gap-10 px-16 py-12 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-0.5 font-serif font-black text-2xl mb-3">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Power</span>
            <span className="text-white">Xchange</span>
          </div>
          <p className="text-blue-300 text-sm leading-relaxed">
            PowerXchange is an online books and magazine rental service. Discover, borrow, and exchange books with ease.
          </p>
          <div className="flex gap-4 mt-5">
            {/* Social icons — open external links */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:stroke-cyan-300 transition-colors">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#93c5fd" stroke="none"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:stroke-cyan-300 transition-colors">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:stroke-cyan-300 transition-colors">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.88 1.1A4.52 4.52 0 0 0 11.89 8a12.82 12.82 0 0 1-9.3-4.71 4.52 4.52 0 0 0 1.4 6.04A4.48 4.48 0 0 1 1.64 9v.06a4.52 4.52 0 0 0 3.62 4.43 4.5 4.5 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.13A9.05 9.05 0 0 1 1 19.54a12.8 12.8 0 0 0 6.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.39-.01-.58A9.17 9.17 0 0 0 23 3z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Information</p>
          {infoLinks.map((item) => (
            <p key={item} onClick={() => onFooterNav(routeMap[item])}
              className="text-blue-300 text-sm mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
              {item}
            </p>
          ))}
        </div>

        <div>
          <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Resources</p>
          {resourceLinks.map((item) => (
            <p key={item} onClick={() => onFooterNav(routeMap[item])}
              className="text-blue-300 text-sm mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
              {item}
            </p>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center">
        <p className="text-xs text-blue-400/60">
          © 2025 PowerXchange · Serviced by{" "}
          <strong className="text-blue-300">BAE SOCIAL PRIVATE LIMITED</strong> · Powered by{" "}
          <strong className="text-blue-300">CAMPUSCOCREATE VENTURES LLP</strong>
        </p>
      </div>
    </footer>
  );
}

/* ── HomePage ── */
export default function HomePage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("books");

  const handleBookClick     = (book)      => navigate("/buybook",  { state: { book } });
  const handleGenreClick    = (genre)     => navigate("/browse",   { state: { genre } });
  const handleConditionClick= (condition) => navigate("/browse",   { state: { condition } });
  const handleAuthorClick   = (author)    => navigate("/browse",   { state: { author } });
  const handleFooterNav     = (path)      => navigate(path);

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} isProfile={isLoggedIn} />

      <Hero onBrowse={() => navigate("/browse")} />
      <GenreStrip onGenreClick={handleGenreClick} />

      {/* Tabs */}
      <div className="flex justify-center mt-8">
        <div className="bg-white border border-blue-100 rounded-full p-1 flex gap-1 shadow-sm">
          {["books", "authors"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-8 py-2 rounded-full text-base font-semibold transition-all duration-200
                ${tab === t
                  ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-200"
                  : "text-slate-400 hover:text-blue-600"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "authors" ? (
        <AuthorSlider onAuthorClick={handleAuthorClick} />
      ) : (
        <>
          <BookGridSlider  title="Trending Now"               data={trending}    onBookClick={handleBookClick} />
          <BookRowSlider   title="New Arrivals"               data={newArrivals} onBookClick={handleBookClick} />
          <BookRowSlider   title="Kids Special"               data={kids}        onBookClick={handleBookClick} />
          <ConditionSlider title="Choose Your Book Condition" data={condition}   onConditionClick={handleConditionClick} />
        </>
      )}

      <Footer onFooterNav={handleFooterNav} />
    </div>
  );
} 