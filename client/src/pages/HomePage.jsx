import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";

export const AUTHORS = [
  { id: "roald-dahl", name: "Roald Dahl",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Roald_Dahl_1954.jpg/240px-Roald_Dahl_1954.jpg",
    genre: "Children's Fiction",
    about: "Roald Dahl (1916–1990) was a British novelist born in Wales to Norwegian parents. Known for darkly comic tales with unexpected endings, his children's books — including Charlie and the Chocolate Factory and Matilda — remain beloved worldwide.",
    books: [
      { id: "b-rd-1", title: "Charlie & the Chocolate Factory", img: "https://covers.openlibrary.org/b/isbn/9780142410318-M.jpg", price: 180 },
      { id: "b-rd-2", title: "Matilda",           img: "https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg", price: 160 },
      { id: "b-rd-3", title: "The BFG",            img: "https://covers.openlibrary.org/b/isbn/9780142410387-M.jpg", price: 150 },
      { id: "b-rd-4", title: "James & the Giant Peach", img: "https://covers.openlibrary.org/b/isbn/9780142410363-M.jpg", price: 145 },
    ],
  },
  { id: "jk-rowling", name: "J.K. Rowling",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/240px-J._K._Rowling_2010.jpg",
    genre: "Fantasy",
    about: "J.K. Rowling (born 1965) is a British author best known for the Harry Potter series, which has sold over 500 million copies. She wrote the first book while a single mother and it became one of the best-selling series in history.",
    books: [
      { id: "b-jk-1", title: "Harry Potter: Sorcerer's Stone",    img: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg", price: 250 },
      { id: "b-jk-2", title: "Harry Potter: Chamber of Secrets",  img: "https://covers.openlibrary.org/b/isbn/9780439064866-M.jpg", price: 250 },
      { id: "b-jk-3", title: "Harry Potter: Prisoner of Azkaban", img: "https://covers.openlibrary.org/b/isbn/9780439136358-M.jpg", price: 260 },
    ],
  },
  { id: "rick-riordan", name: "Rick Riordan",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rick_Riordan_2014.jpg/240px-Rick_Riordan_2014.jpg",
    genre: "Fantasy / Mythology",
    about: "Rick Riordan (born 1964) is an American author and former teacher best known for Percy Jackson & the Olympians. He created Percy Jackson to help his son, diagnosed with ADHD and dyslexia. His books have sold over 30 million copies.",
    books: [
      { id: "b-rr-1", title: "Percy Jackson: The Lightning Thief", img: "https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg", price: 220 },
      { id: "b-rr-2", title: "Percy Jackson: Sea of Monsters",     img: "https://covers.openlibrary.org/b/isbn/9780786838652-M.jpg", price: 220 },
    ],
  },
  { id: "sudha-murthy", name: "Sudha Murthy",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Sudha_Murthy_at_JLF_2018_01.jpg/240px-Sudha_Murthy_at_JLF_2018_01.jpg",
    genre: "Indian Fiction & Non-Fiction",
    about: "Sudha Murthy (born 1950) is an Indian author, educator, and philanthropist. Chairperson of the Infosys Foundation, she has written over 30 books translated into all major Indian languages.",
    books: [
      { id: "b-sm-1", title: "Wise and Otherwise", img: "https://covers.openlibrary.org/b/id/8114491-M.jpg", price: 190 },
      { id: "b-sm-2", title: "The Day I Stopped Drinking Milk", img: "https://covers.openlibrary.org/b/isbn/9780143419174-M.jpg", price: 175 },
    ],
  },
  { id: "dan-brown", name: "Dan Brown",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Dan_Brown_2012.jpg/240px-Dan_Brown_2012.jpg",
    genre: "Thriller",
    about: "Dan Brown (born 1964) is an American thriller author. The Da Vinci Code has sold over 80 million copies, making it one of the best-selling books of all time. His plots weave codes and conspiracy theories around real institutions.",
    books: [
      { id: "b-db-1", title: "The Da Vinci Code", img: "https://covers.openlibrary.org/b/isbn/9780307474278-M.jpg", price: 230 },
      { id: "b-db-2", title: "Angels & Demons",   img: "https://covers.openlibrary.org/b/isbn/9781416524793-M.jpg", price: 220 },
      { id: "b-db-3", title: "Inferno",            img: "https://covers.openlibrary.org/b/isbn/9780385537858-M.jpg", price: 210 },
    ],
  },
  { id: "jeff-kinney", name: "Jeff Kinney",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Jeff_Kinney_2014.jpg/240px-Jeff_Kinney_2014.jpg",
    genre: "Children's / Humor",
    about: "Jeff Kinney (born 1979) is an American author and cartoonist best known for Diary of a Wimpy Kid. The series has sold over 250 million copies worldwide in 65 languages.",
    books: [
      { id: "b-jki-1", title: "Diary of a Wimpy Kid", img: "https://covers.openlibrary.org/b/isbn/9780810993136-M.jpg", price: 200 },
      { id: "b-jki-2", title: "Rodrick Rules",         img: "https://covers.openlibrary.org/b/isbn/9780810994737-M.jpg", price: 200 },
    ],
  },
  { id: "enid-blyton", name: "Enid Blyton",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Enid_blyton.jpg/240px-Enid_blyton.jpg",
    genre: "Children's Fiction",
    about: "Enid Blyton (1897–1968) wrote over 700 children's books including the Famous Five and Secret Seven series. Her books have been translated into over 90 languages and continue to sell millions of copies each year.",
    books: [
      { id: "b-eb-1", title: "Famous Five: Five on a Treasure Island", img: "https://covers.openlibrary.org/b/isbn/9780340796177-M.jpg", price: 140 },
      { id: "b-eb-2", title: "The Magic Faraway Tree", img: "https://covers.openlibrary.org/b/isbn/9780603560934-M.jpg", price: 130 },
    ],
  },
  { id: "james-patterson", name: "James Patterson",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/James_Patterson_2010.jpg/240px-James_Patterson_2010.jpg",
    genre: "Thriller",
    about: "James Patterson (born 1947) has sold over 380 million copies of his books worldwide. Best known for the Alex Cross series, he has written over 200 novels — most of them bestsellers.",
    books: [
      { id: "b-jp-1", title: "Along Came a Spider", img: "https://covers.openlibrary.org/b/isbn/9780446364904-M.jpg", price: 210 },
      { id: "b-jp-2", title: "Kiss the Girls",      img: "https://covers.openlibrary.org/b/isbn/9780446602242-M.jpg", price: 200 },
    ],
  },
];

export const BOOKS = [
  { id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 299, listingType: "rent", condition: "good", genre: "Science", description: "A comprehensive introduction to modern algorithms covering sorting, searching, graph algorithms and dynamic programming. Some pencil markings on pages 40–60, otherwise great shape.", imageUrl: "https://covers.openlibrary.org/b/id/8739161-L.jpg", available: true, rentedTillNow: 6, avgReadingTime: "3 weeks", avgRentingTime: "4 weeks", authorId: null, seller: { name: "Arjun Sharma", college: "NIT Surathkal", rating: 4.5, totalRatings: 12 }, relatedBooks: [{ id: "2", title: "Clean Code", author: "Robert C. Martin", price: 199, imageUrl: "https://covers.openlibrary.org/b/id/8432472-L.jpg" }], feedback: [{ id: 1, user: "Sneha R.", college: "PESIT Bangalore", rating: 5, comment: "Excellent condition, very responsive seller.", date: "Jan 2025" }, { id: 2, user: "Karthik M.", college: "NITK Surathkal", rating: 4, comment: "Good condition as described. Overall great experience.", date: "Dec 2024" }] },
  { id: "2", title: "Clean Code", author: "Robert C. Martin", price: 199, listingType: "sell", condition: "new", genre: "Science", description: "Like new condition. Only read once. A handbook of agile software craftsmanship — perfect for learning maintainable, readable code.", imageUrl: "https://covers.openlibrary.org/b/id/8432472-L.jpg", available: true, rentedTillNow: 3, avgReadingTime: "2 weeks", avgRentingTime: "3 weeks", authorId: null, seller: { name: "Priya Nair", college: "RVCE Bangalore", rating: 5.0, totalRatings: 8 }, relatedBooks: [{ id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 299, imageUrl: "https://covers.openlibrary.org/b/id/8739161-L.jpg" }], feedback: [{ id: 1, user: "Rahul V.", college: "BMS College", rating: 5, comment: "Absolutely like new. Seller very professional.", date: "Feb 2025" }] },
  { id: "b-rd-1", title: "Charlie & the Chocolate Factory", author: "Roald Dahl", price: 180, listingType: "sell", condition: "good", genre: "Kids", description: "Classic Roald Dahl in good condition with minor cover wear. Charlie Bucket's golden ticket adventure into Willy Wonka's magical chocolate factory.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780142410318-M.jpg", available: true, rentedTillNow: 8, avgReadingTime: "1 week", avgRentingTime: "2 weeks", authorId: "roald-dahl", seller: { name: "Meera Rao", college: "Christ University Bangalore", rating: 4.8, totalRatings: 15 }, relatedBooks: [{ id: "b-rd-2", title: "Matilda", author: "Roald Dahl", price: 160, imageUrl: "https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg" }], feedback: [{ id: 1, user: "Aditya K.", college: "BMS College", rating: 5, comment: "Great copy, fast delivery!", date: "Mar 2025" }] },
  { id: "b-rd-2", title: "Matilda", author: "Roald Dahl", price: 160, listingType: "rent", condition: "good", genre: "Kids", description: "Roald Dahl's beloved story of a gifted girl with telekinetic powers. Good condition with minor spine crease.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg", available: true, rentedTillNow: 10, avgReadingTime: "5 days", avgRentingTime: "2 weeks", authorId: "roald-dahl", seller: { name: "Nandini S.", college: "PES University", rating: 4.6, totalRatings: 9 }, relatedBooks: [{ id: "b-rd-1", title: "Charlie & the Chocolate Factory", author: "Roald Dahl", price: 180, imageUrl: "https://covers.openlibrary.org/b/isbn/9780142410318-M.jpg" }], feedback: [{ id: 1, user: "Pooja M.", college: "RVCE", rating: 5, comment: "Perfect condition. My childhood favourite!", date: "Feb 2025" }] },
  { id: "b-jk-1", title: "Harry Potter: Sorcerer's Stone", author: "J.K. Rowling", price: 250, listingType: "sell", condition: "new", genre: "Fiction", description: "Brand-new copy of the first Harry Potter novel. Harry discovers his magical heritage and begins his journey at Hogwarts.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg", available: true, rentedTillNow: 4, avgReadingTime: "1.5 weeks", avgRentingTime: "3 weeks", authorId: "jk-rowling", seller: { name: "Rohit B.", college: "NITK Surathkal", rating: 4.9, totalRatings: 20 }, relatedBooks: [{ id: "b-jk-2", title: "Chamber of Secrets", author: "J.K. Rowling", price: 250, imageUrl: "https://covers.openlibrary.org/b/isbn/9780439064866-M.jpg" }], feedback: [{ id: 1, user: "Asha T.", college: "MIT Manipal", rating: 5, comment: "Brand new. Delivered quickly!", date: "Jan 2025" }] },
  { id: "b-rr-1", title: "Percy Jackson: The Lightning Thief", author: "Rick Riordan", price: 220, listingType: "rent", condition: "good", genre: "Fiction", description: "Percy Jackson discovers he is the son of a Greek god and must prevent a war among the Olympians. Good condition, minor spine crease.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg", available: true, rentedTillNow: 7, avgReadingTime: "1 week", avgRentingTime: "2 weeks", authorId: "rick-riordan", seller: { name: "Suraj K.", college: "Manipal Institute of Technology", rating: 4.7, totalRatings: 11 }, relatedBooks: [{ id: "b-rr-2", title: "Sea of Monsters", author: "Rick Riordan", price: 220, imageUrl: "https://covers.openlibrary.org/b/isbn/9780786838652-M.jpg" }], feedback: [{ id: 1, user: "Tanvi M.", college: "SJCE Mysuru", rating: 5, comment: "Great read. Book arrived in perfect condition.", date: "Mar 2025" }] },
  { id: "b-db-1", title: "The Da Vinci Code", author: "Dan Brown", price: 230, listingType: "sell", condition: "good", genre: "Fiction", description: "Dan Brown's bestselling thriller. Robert Langdon investigates a murder in the Louvre that leads to a shocking conspiracy. Good condition.", imageUrl: "https://covers.openlibrary.org/b/isbn/9780307474278-M.jpg", available: true, rentedTillNow: 5, avgReadingTime: "10 days", avgRentingTime: "3 weeks", authorId: "dan-brown", seller: { name: "Ananya P.", college: "PESIT Bangalore", rating: 4.8, totalRatings: 14 }, relatedBooks: [{ id: "b-db-2", title: "Angels & Demons", author: "Dan Brown", price: 220, imageUrl: "https://covers.openlibrary.org/b/isbn/9781416524793-M.jpg" }], feedback: [{ id: 1, user: "Rahul S.", college: "BMSCE", rating: 4, comment: "Good condition, great thriller!", date: "Jan 2025" }] },
  { id: "b-sm-1", title: "Wise and Otherwise", author: "Sudha Murthy", price: 190, listingType: "sell", condition: "new", genre: "Biography", description: "A collection of 51 real-life stories from Sudha Murthy's experiences travelling across India. New condition, unread.", imageUrl: "https://covers.openlibrary.org/b/id/8114491-M.jpg", available: true, rentedTillNow: 2, avgReadingTime: "1 week", avgRentingTime: "2 weeks", authorId: "sudha-murthy", seller: { name: "Kavya R.", college: "RVCE Bangalore", rating: 4.9, totalRatings: 7 }, relatedBooks: [], feedback: [{ id: 1, user: "Deepa N.", college: "Christ University", rating: 5, comment: "Beautifully written. New copy as described.", date: "Feb 2025" }] },
];

export const GENRES = [
  { name: "Biography",    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop" },
  { name: "Arts & Crafts",img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop" },
  { name: "Business",     img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop" },
  { name: "Comics",       img: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&h=200&fit=crop" },
  { name: "Cookery",      img: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=200&fit=crop" },
  { name: "History",      img: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop" },
  { name: "Kids",         img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop" },
  { name: "Science",      img: "https://images.unsplash.com/photo-1532094349884-543559c5f185?w=200&h=200&fit=crop" },
  { name: "Sports",       img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop" },
  { name: "Travel",       img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop" },
  { name: "Fiction",      img: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=200&h=200&fit=crop" },
  { name: "Self Help",    img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=200&fit=crop" },
];

const kidsBooks = [
  { id: "k-1", title: "Goodnight Moon",            img: "https://covers.openlibrary.org/b/isbn/9780064430173-M.jpg" },
  { id: "k-2", title: "Where the Wild Things Are", img: "https://covers.openlibrary.org/b/isbn/9780064431781-M.jpg" },
  { id: "k-3", title: "Green Eggs and Ham",        img: "https://covers.openlibrary.org/b/isbn/9780394800165-M.jpg" },
  { id: "k-4", title: "Charlotte's Web",           img: "https://covers.openlibrary.org/b/isbn/9780064400558-M.jpg" },
  { id: "k-5", title: "James & the Giant Peach",   img: "https://covers.openlibrary.org/b/isbn/9780142410363-M.jpg" },
];

const conditionData = [
  { title: "Brand New",      img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=220&fit=crop" },
  { title: "Like New",       img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=220&fit=crop" },
  { title: "Good Condition", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=220&fit=crop" },
  { title: "Old Copies",     img: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=220&fit=crop" },
];

export function searchBooks(query, booksToUse = BOOKS) {
  if (!query) return [];
  const q = query.toLowerCase();
  return booksToUse.filter(b =>
    b.title?.toLowerCase().includes(q) ||
    b.author?.toLowerCase().includes(q) ||
    b.genre?.toLowerCase().includes(q)
  );
}

function AccentBar() {
  return <span className="inline-block w-1 h-5 rounded-sm bg-gradient-to-b from-blue-600 to-cyan-400 flex-shrink-0" />;
}
function ArrowBtn({ side, onClick }) {
  return (
    <button onClick={onClick}
      className={`absolute ${side === "left" ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 z-10
        w-9 h-9 rounded-full bg-white border border-blue-100 shadow-md text-blue-600 text-xl leading-none
        flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200`}>
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
      className="border border-blue-600 text-blue-600 text-xs font-semibold rounded-full px-4 py-1
        hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-400 hover:text-white
        hover:border-transparent transition-all duration-200">
      {label}
    </button>
  );
}

function Hero({ onBrowse }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-400
      flex items-center justify-between px-16 py-20 min-h-[400px]">
      <div className="absolute -top-12 right-44 w-72 h-72 rounded-full bg-cyan-400/10 pointer-events-none" />
      <div className="absolute -bottom-16 left-80 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="max-w-lg z-10">
        <h1 className="font-serif font-black text-5xl text-white leading-tight mb-3">
          Give Your Books<br />
          <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">a Second Life</span>
        </h1>
        <p className="text-white/75 text-lg leading-relaxed mb-7">
          Buy, sell, and rent textbooks with fellow students at your campus.
        </p>
        <button onClick={onBrowse}
          className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold
            px-8 py-3 rounded-xl shadow-[0_6px_22px_rgba(0,198,255,0.4)] hover:scale-105 transition-transform duration-200">
          Browse Books
        </button>
      </div>
      <div className="relative z-10">
        <img src="https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=760&h=560&fit=crop"
          alt="Books" className="w-96 h-72 object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border-2 border-white/15"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=760&h=560&fit=crop"; }} />
      </div>
    </section>
  );
}

// ← sectionRef added as prop
function GenreStrip({ onGenreClick, sectionRef }) {
  const ref = useRef(null);
  const [dbGenres, setDbGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("books")
        .select("genre")
        .eq("is_approved", true)
        .eq("is_available", true);

      if (!error && data) {
        // Get unique genres from books
        const uniqueGenres = [...new Set(data.map(b => b.genre).filter(g => g))];
        setDbGenres(uniqueGenres.map(g => ({
          name: g,
          img: `https://ui-avatars.com/api/?name=${encodeURIComponent(g)}&size=80&background=dbeafe&color=1d4ed8&bold=true`
        })));
      }
    };

    fetchGenres();
  }, []);

  const genresToShow = dbGenres.length > 0 ? dbGenres : GENRES;

  return (
    <div ref={sectionRef} className="px-7 mt-10">
      <h2 className="text-center font-serif font-bold text-2xl text-blue-950 mb-6">Browse by Genre</h2>
      <div className="relative">
        <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide px-2 py-1">
          {genresToShow.map((g) => (
            <div key={g.name} onClick={() => onGenreClick && onGenreClick(g.name)}
              className="flex flex-col items-center min-w-[96px] cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-100
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm">
                <img src={g.img} alt={g.name} className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name)}&size=80&background=dbeafe&color=1d4ed8`; }} />
              </div>
              <p className="mt-2 text-center text-sm font-semibold text-blue-900 leading-tight">{g.name}</p>
            </div>
          ))}
        </div>
        <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
        <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
      </div>
    </div>
  );
}

function SearchResults({ query, onBookClick, booksToUse }) {
  const results = searchBooks(query, booksToUse);
  return (
    <div className="px-7 mt-8">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-2">
        <AccentBar />Search results for "{query}"
        <span className="text-sm font-normal text-slate-400">({results.length} found)</span>
      </h2>
      {results.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">No books found for "{query}"</p>
          <p className="text-sm mt-1">Try a different title, author, or genre</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((b) => (
            <div key={b.id} onClick={() => onBookClick(b.id)}
              className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm
                hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="h-40 overflow-hidden bg-blue-50">
                <img src={b.imageUrl} alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = "https://placehold.co/200x160?text=Book"; }} />
              </div>
              <div className="p-3">
                <p className="font-semibold text-blue-950 text-sm leading-snug">{b.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{b.author}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-blue-700">₹{b.price}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.listingType === "sell" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                    {b.listingType === "sell" ? "For Sale" : "For Rent"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookGridSlider({ title, data, onBookClick }) {
  const [page, setPage] = useState(0);
  const perPage    = 7;
  const totalPages = Math.ceil(data.length / perPage);
  const chunk      = data.slice(page * perPage, page * perPage + perPage);
  const featured   = chunk[0];
  const grid       = chunk.slice(1, 7);

  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div className="flex gap-3 items-stretch">
        {featured && (
          <div onClick={() => onBookClick(featured.id)}
            className="flex-shrink-0 w-48 rounded-xl overflow-hidden border border-blue-100
              shadow-md hover:-translate-y-1 hover:shadow-blue-200 transition-all duration-200 cursor-pointer">
            <img src={featured.img} alt={featured.title}
              className="w-full h-full min-h-[280px] object-cover"
              onError={(e) => { e.target.src = "https://placehold.co/192x280/1d4ed8/ffffff?text=Book"; }} />
          </div>
        )}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => {
            const book = grid[i];
            if (!book) return <div key={i} className="bg-blue-50 rounded-xl border border-dashed border-blue-200" />;
            return (
              <div key={i} onClick={() => onBookClick(book.id)}
                className="bg-white rounded-xl border border-blue-100 shadow-sm p-3 flex gap-3 items-center
                  hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100 transition-all duration-200 cursor-pointer">
                <img src={book.img} alt={book.title}
                  className="w-14 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
                  onError={(e) => { e.target.src = "https://placehold.co/56x80/1d4ed8/ffffff?text=Book"; }} />
                <div>
                  <p className="font-semibold text-sm text-blue-950 leading-snug mb-2">{book.title}</p>
                  <RentBtn onClick={(e) => { e.stopPropagation(); onBookClick(book.id); }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 h-0.5 bg-blue-100 rounded-full">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
          style={{ width: `${100 / Math.max(totalPages,1)}%`, marginLeft: `${page * (100 / Math.max(totalPages,1))}%` }} />
      </div>
      {page > 0            && <ArrowBtn side="left"  onClick={() => setPage(p => p - 1)} />}
      {page < totalPages-1 && <ArrowBtn side="right" onClick={() => setPage(p => p + 1)} />}
    </div>
  );
}

function BookRowSlider({ title, data, onBookClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {data.map((book, i) => (
          <div key={i} onClick={() => onBookClick && onBookClick(book.id)}
            className="min-w-[240px] max-w-[240px] flex-shrink-0 bg-white rounded-xl border border-blue-100
              shadow-sm p-3 flex gap-3 items-center hover:-translate-y-1 hover:shadow-md hover:shadow-blue-100
              transition-all duration-200 cursor-pointer">
            <img src={book.img} alt={book.title}
              className="w-[72px] h-24 object-cover rounded-lg flex-shrink-0 shadow-sm"
              onError={(e) => { e.target.src = "https://placehold.co/72x96/1d4ed8/ffffff?text=Book"; }} />
            <div>
              <p className="font-semibold text-sm text-blue-950 leading-snug mb-2.5">{book.title}</p>
              <RentBtn />
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

function ConditionSlider({ title, data, onConditionClick }) {
  const ref = useRef(null);
  return (
    <div className="px-7 mt-8 relative">
      <h2 className="flex items-center gap-2.5 font-serif font-bold text-xl text-blue-950 mb-4">
        <AccentBar />{title}
      </h2>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {data.map((item, i) => (
          <div key={i}
            onClick={() => onConditionClick && onConditionClick(item.title)}
            className="min-w-[210px] max-w-[210px] flex-shrink-0 bg-white rounded-xl border border-blue-100
              overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer">
            <img src={item.img} alt={item.title} className="w-full h-32 object-cover"
              onError={(e) => { e.target.src = `https://placehold.co/210x128/1d4ed8/ffffff?text=${encodeURIComponent(item.title)}`; }} />
            <div className="p-3">
              <p className="font-semibold text-base text-blue-950 mb-2">{item.title}</p>
              <RentBtn label="Browse" />
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

function AuthorSlider({ onAuthorClick }) {
  const ref = useRef(null);
  const [dbAuthors, setDbAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbAuthors(data);
      }
    };

    fetchAuthors();
  }, []);

  const authorsToShow = dbAuthors.length > 0 ? dbAuthors : AUTHORS;

  return (
    <div className="px-7 mt-6 relative">
      <div ref={ref} className="flex gap-7 overflow-x-auto scrollbar-hide py-2">
        {authorsToShow.map((a) => (
          <div key={a.id} onClick={() => onAuthorClick(a.id)}
            className="flex flex-col items-center min-w-[96px] cursor-pointer group">
            <img src={a.photo_url || a.img} alt={a.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-100
                group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200 shadow-sm"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&size=80&background=dbeafe&color=1d4ed8&bold=true`; }} />
            <p className="mt-2 text-center text-sm font-medium text-blue-900 leading-tight">{a.name}</p>
          </div>
        ))}
      </div>
      <ArrowBtn side="left"  onClick={() => ref.current.scrollBy({ left: -320, behavior: "smooth" })} />
      <ArrowBtn side="right" onClick={() => ref.current.scrollBy({ left:  320, behavior: "smooth" })} />
    </div>
  );
}

export default function HomePage({ isLoggedIn, onLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [tab, setTab] = useState("books");
  const genreRef  = useRef(null);
  const [dbBooks, setDbBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArrivalsQueue, setNewArrivalsQueue] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);

  const params      = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  // Fetch all books for general display
  useEffect(() => {
    const fetchBooks = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDbBooks(data);
      }
      setLoading(false);
    };

    fetchBooks();
  }, []);

  // Fetch new arrivals queue: latest 20 books by date added
  useEffect(() => {
    const fetchNewArrivals = async () => {
      const { supabase } = await import("../supabase");
      const { data, error } = await supabase
        .from("books")
        .select("id, title, image_url, cover_url")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const queue = data.map(b => ({
          id: b.id,
          title: b.title,
          img: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book"
        }));
        setNewArrivalsQueue(queue);
      }
    };

    fetchNewArrivals();
  }, []);

  // Fetch trending books: top 10 by sales, views, ratings (with fallback)
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      const { supabase } = await import("../supabase");

      // First, try to get books with statistics (trending score)
      const { data: statsData, error: statsError } = await supabase
        .from("book_statistics")
        .select(`
          trending_score,
          books (
            id,
            title,
            image_url,
            cover_url,
            is_approved,
            is_available,
            quantity
          )
        `)
        .order("trending_score", { ascending: false })
        .limit(30); // fetch more, filter client-side

      if (!statsError && statsData && statsData.length > 0) {
        // Filter to only in-stock books
        const trending = statsData
          .filter(s => s.books && s.books.quantity > 0)
          .slice(0, 10)
          .map(s => ({
            id: s.books.id,
            title: s.books.title,
            img: s.books.image_url || s.books.cover_url || "https://placehold.co/200x160?text=Book",
            trendingScore: s.trending_score
          }));

        if (trending.length > 0) {
          setTrendingBooks(trending);
          return;
        }
      }

      // No statistics data - fallback to recently added books
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("books")
        .select("id, title, image_url, cover_url")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!fallbackError && fallbackData) {
        const fallback = fallbackData.map(b => ({
          id: b.id,
          title: b.title,
          img: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book"
        }));
        setTrendingBooks(fallback);
      }
    };

    fetchTrendingBooks();
  }, []);

  // Use database books if available, otherwise fallback to hardcoded
  const booksToUse = dbBooks.length > 0 ? dbBooks.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author || "Unknown",
    price: b.price || 0,
    listingType: b.price === 0 ? "exchange" : "sell",
    condition: b.condition || "good",
    genre: b.category || b.genre || "General",
    description: b.description || "",
    imageUrl: b.image_url || b.cover_url || "https://placehold.co/200x160?text=Book",
    available: b.is_available !== false,
    seller: { name: b.seller_name || "Unknown", college: "N/A" },
  })) : BOOKS;

  // trending is now fetched from database based on sales, views, ratings
  // falls back to recently added books if no statistics exist

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      {searchQuery ? (
        <div className="pb-20">
          <div className="max-w-6xl mx-auto px-4 pt-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          <SearchResults query={searchQuery} onBookClick={(id) => navigate(`/books/${id}`)} booksToUse={booksToUse} />
        </div>
      ) : (
        <>
          {/* ← onBrowse now scrolls to genreRef */}
          <Hero onBrowse={() => genreRef.current?.scrollIntoView({ behavior: "smooth" })} />

          {/* ← sectionRef passed in */}
          <GenreStrip
            sectionRef={genreRef}
            onGenreClick={(name) => navigate(`/genre/${encodeURIComponent(name)}`)}
          />

          <div className="flex justify-center mt-8">
            <div className="bg-white border border-blue-100 rounded-full p-1 flex gap-1 shadow-sm">
              {["books", "authors"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-8 py-2.5 rounded-full text-base font-semibold transition-all duration-200 ${
                    tab === t
                      ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-md shadow-blue-200"
                      : "text-slate-400 hover:text-blue-600"
                  }`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {tab === "authors" ? (
            <AuthorSlider onAuthorClick={(id) => navigate(`/author/${id}`)} />
          ) : (
            <>
              {loading ? (
                <div className="text-center py-20 text-gray-500">Loading books...</div>
              ) : (
                <>
                  <BookGridSlider  title="Trending Now"               data={trendingBooks}   onBookClick={(id) => navigate(`/books/${id}`)} />
                  <BookRowSlider   title="New Arrivals"               data={newArrivalsQueue} onBookClick={(id) => navigate(`/books/${id}`)} />
                  <ConditionSlider title="Choose Your Book Condition" data={conditionData}   onConditionClick={(cond) => navigate(`/condition/${encodeURIComponent(cond)}`)} />
                </>
              )}
            </>
          )}

          <Footer />
        </>
      )}
    </div>
  );
}