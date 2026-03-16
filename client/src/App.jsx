import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing    from "./pages/Landing";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import HomePage   from "./pages/HomePage";
import Profile    from "./pages/Profile";
import BookDetail from "./pages/BookDetail";
import BuyBook    from "./pages/Buybook";
import AuthorPage from "./pages/AuthorPage";
import GenrePage  from "./pages/GenrePage";
// import Browse   from "./pages/Browse";    // or wherever Browse.jsx lives
import SellBook from "./pages/Sellbook";  // or wherever SellBook.jsx lives

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Global cart & wishlist — shared between BookDetail and Profile
  const [cart,     setCart]     = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart     = (book) => setCart(prev     => prev.find(b => b.id === book.id) ? prev : [...prev, book]);
  const removeFromCart= (id)   => setCart(prev     => prev.filter(b => b.id !== id));
  const addToWishlist = (book) => setWishlist(prev => prev.find(b => b.id === book.id) ? prev : [...prev, book]);
  const removeFromWishlist = (id) => setWishlist(prev => prev.filter(b => b.id !== id));

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => { setIsLoggedIn(false); setCart([]); setWishlist([]); };
  const guard = (el) => isLoggedIn ? el : <Navigate to="/" replace />;

  const sharedProps = { isLoggedIn, onLogout: handleLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Landing  {...sharedProps} />} />
        <Route path="/login"      element={<Login    onLogin={handleLogin} />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/home"       element={guard(<HomePage   {...sharedProps} />)} />
        <Route path="/browse"     element={guard(<HomePage   {...sharedProps} />)} />
        <Route path="/profile"    element={guard(<Profile    {...sharedProps} />)} />
        <Route path="/books/:id"  element={guard(<BookDetail {...sharedProps} />)} />
        <Route path="/buybook"    element={guard(<BuyBook    {...sharedProps} />)} />
        <Route path="/author/:id" element={guard(<AuthorPage {...sharedProps} />)} />
        <Route path="/genre/:name" element={guard(<GenrePage  {...sharedProps} />)} />
        <Route path="*"           element={<Navigate to="/" replace />} />
        {/* <Route path="/browse"   element={<Browse />} /> */}
        <Route path="/sellbook" element={<SellBook />} />
      </Routes>
    </BrowserRouter>
  );
}
