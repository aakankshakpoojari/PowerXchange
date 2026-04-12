import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing    from "./pages/Landing";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import HomePage   from "./pages/HomePage";
import Profile    from "./pages/Profile";
import MyBooks    from "./pages/MyBooks";
import BookDetail from "./pages/BookDetail";
import BuyBook    from "./pages/Buybook";
import AuthorPage from "./pages/AuthorPage";
import GenrePage  from "./pages/GenrePage";
import GenreBooks from "./pages/GenreBooks";
import ConditionBooks from "./pages/ConditionBooks";
import SellBook   from "./pages/Sellbook";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminBooks from "./pages/AdminBooks";
import AdminTransactions from "./pages/AdminTransactions";
import AdminAuthors from "./pages/AdminAuthors";
import AdminReports from "./pages/AdminReports";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart,     setCart]     = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart          = (book) => setCart(prev     => prev.find(b => b.id === book.id) ? prev : [...prev, book]);
  const removeFromCart     = (id)   => setCart(prev     => prev.filter(b => b.id !== id));
  const addToWishlist      = (book) => setWishlist(prev => prev.find(b => b.id === book.id) ? prev : [...prev, book]);
  const removeFromWishlist = (id)   => setWishlist(prev => prev.filter(b => b.id !== id));

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => { setIsLoggedIn(false); setCart([]); setWishlist([]); };
  const guard = (el) => isLoggedIn ? el : <Navigate to="/" replace />;

  const sharedProps = { isLoggedIn, onLogout: handleLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Landing    {...sharedProps} />} />
        <Route path="/login"       element={<Login      onLogin={handleLogin} />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home"        element={guard(<HomePage   {...sharedProps} />)} />
        <Route path="/browse"      element={guard(<HomePage   {...sharedProps} />)} />
        <Route path="/profile"     element={guard(<Profile    {...sharedProps} />)} />
        <Route path="/my-books"    element={guard(<MyBooks    {...sharedProps} />)} />
        <Route path="/books/:id"   element={guard(<BookDetail {...sharedProps} />)} />
        <Route path="/buybook/:id"     element={guard(<BuyBook  {...sharedProps} />)} />
        <Route path="/author/:id"  element={guard(<AuthorPage {...sharedProps} />)} />
        <Route path="/genre/:name" element={guard(<GenrePage  {...sharedProps} />)} />
        <Route path="/genre-books/:genre" element={guard(<GenreBooks {...sharedProps} />)} />
        <Route path="/condition/:condition" element={guard(<ConditionBooks {...sharedProps} />)} />
        <Route path="/sellbook"    element={guard(<SellBook {...sharedProps} />)} />
        <Route path="/admin"       element={guard(<AdminDashboard {...sharedProps} />)} />
        <Route path="/admin/users" element={guard(<AdminUsers {...sharedProps} />)} />
        <Route path="/admin/books" element={guard(<AdminBooks {...sharedProps} />)} />
        <Route path="/admin/authors" element={guard(<AdminAuthors {...sharedProps} />)} />
        <Route path="/admin/transactions" element={guard(<AdminTransactions {...sharedProps} />)} />
        <Route path="/admin/reports" element={guard(<AdminReports {...sharedProps} />)} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}