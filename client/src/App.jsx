import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase";
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
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import TransactionDetail from "./pages/TransactionDetail";
import NotificationsPage from "./pages/NotificationsPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";

export default function App() {
  const [authState, setAuthState] = useState("loading");
  const [cart,     setCart]       = useState([]);
  const [wishlist, setWishlist]   = useState([]);

  // Use a ref so all callbacks always see the latest userId without needing it as a dependency
  const userIdRef = useRef(null);

  // ── Load cart & wishlist from DB when user logs in ───────────────────────
  const loadUserData = useCallback(async (uid) => {
    if (!uid) { setCart([]); setWishlist([]); return; }

    // Load cart joined with books
    const { data: cartRows, error: cartErr } = await supabase
      .from("cart")
      .select("book_id, books(id, title, author, price, image_url, is_available, genre, condition)")
      .eq("user_id", uid);

    if (cartErr) console.error("Cart load error:", cartErr.message);
    if (cartRows) {
      // Filter out unavailable books from cart
      setCart(cartRows.filter(r => r.books && r.books.is_available !== false && (r.books.quantity === null || r.books.quantity > 0)).map(r => ({ ...r.books, imageUrl: r.books.image_url })));
    }

    // Load wishlist joined with books
    const { data: wishlistRows, error: wErr } = await supabase
      .from("wishlist")
      .select("book_id, books(id, title, author, price, image_url, is_available, genre, condition)")
      .eq("user_id", uid);

    if (wErr) console.error("Wishlist load error:", wErr.message);
    if (wishlistRows) {
      setWishlist(wishlistRows.filter(r => r.books).map(r => ({ ...r.books, imageUrl: r.books.image_url })));
    }
  }, []);

  // ── Auth state management ─────────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async (session) => {
      if (!session) {
        setAuthState("guest");
        userIdRef.current = null;
        setCart([]);
        setWishlist([]);
        return;
      }

      const uid = session.user.id;
      userIdRef.current = uid;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_blocked")
        .eq("id", uid)
        .single();

      // If no profile exists, user was deleted by admin — force logout
      if (!profile) {
        await supabase.auth.signOut();
        setAuthState("guest");
        userIdRef.current = null;
        setCart([]);
        setWishlist([]);
        return;
      }

      // If user is blocked, sign them out immediately
      if (profile.is_blocked) {
        await supabase.auth.signOut();
        setAuthState("guest");
        userIdRef.current = null;
        setCart([]);
        setWishlist([]);
        return;
      }

      if (profile.role === "admin") {
        setAuthState("admin");
      } else {
        const { data: adminRole } = await supabase
          .from("admin_roles")
          .select("id")
          .eq("user_id", uid)
          .maybeSingle();
        setAuthState(adminRole ? "admin" : "user");
      }

      await loadUserData(uid);
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── Cart actions ─────────────────────────────────────────────────────────
  const addToCart = useCallback(async (book) => {
    // Check if book is available before adding
    if (book.is_available === false || (typeof book.quantity === 'number' && book.quantity <= 0)) {
      alert("This book is currently out of stock and cannot be added to cart.");
      return;
    }

    // Optimistic update
    setCart(prev => prev.find(b => b.id === book.id) ? prev : [...prev, { ...book, imageUrl: book.imageUrl || book.image_url }]);

    const uid = userIdRef.current;
    if (!uid) return;

    const { error } = await supabase
      .from("cart")
      .upsert({ user_id: uid, book_id: book.id }, { onConflict: "user_id,book_id" });

    if (error) console.error("Add to cart error:", error.message);
  }, []);

  const removeFromCart = useCallback(async (bookId) => {
    setCart(prev => prev.filter(b => b.id !== bookId));

    const uid = userIdRef.current;
    if (!uid) return;

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", uid)
      .eq("book_id", bookId);

    if (error) console.error("Remove from cart error:", error.message);
  }, []);

  // ── Wishlist actions ──────────────────────────────────────────────────────
  const addToWishlist = useCallback(async (book) => {
    setWishlist(prev => prev.find(b => b.id === book.id) ? prev : [...prev, { ...book, imageUrl: book.imageUrl || book.image_url }]);

    const uid = userIdRef.current;
    if (!uid) return;

    const { error } = await supabase
      .from("wishlist")
      .upsert({ user_id: uid, book_id: book.id }, { onConflict: "user_id,book_id" });

    if (error) console.error("Add to wishlist error:", error.message);
  }, []);

  const removeFromWishlist = useCallback(async (bookId) => {
    setWishlist(prev => prev.filter(b => b.id !== bookId));

    const uid = userIdRef.current;
    if (!uid) return;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", uid)
      .eq("book_id", bookId);

    if (error) console.error("Remove from wishlist error:", error.message);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setCart([]);
    setWishlist([]);
    userIdRef.current = null;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isLoggedIn = authState === "user" || authState === "admin";
  const isAdmin = authState === "admin";

  // Debug: log admin state changes
  useEffect(() => {
    console.log("App.jsx: authState =", authState, "isAdmin =", isAdmin);
  }, [authState, isAdmin]);

  const sharedProps = { isLoggedIn, isAdmin, onLogout: handleLogout, cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist };

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-400 dark:text-blue-300 text-lg">Loading...</div>
      </div>
    );
  }

  const requireAuth  = (el) => isLoggedIn ? el : <Navigate to="/login" replace />;
  const requireAdmin = (el) => authState === "admin" ? el : isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/"            element={<Landing    {...sharedProps} />} />
        <Route path="/login"       element={<Login      onLogin={() => {}} />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home"        element={requireAuth(<HomePage   {...sharedProps} />)} />
        <Route path="/browse"      element={requireAuth(<HomePage   {...sharedProps} />)} />
        <Route path="/profile"     element={requireAuth(<Profile    {...sharedProps} />)} />
        <Route path="/my-books"    element={requireAuth(<MyBooks    {...sharedProps} />)} />
        <Route path="/books/:id"   element={requireAuth(<BookDetail {...sharedProps} />)} />
        <Route path="/buybook/:id" element={requireAuth(<BuyBook    {...sharedProps} />)} />
        <Route path="/author/:id"  element={requireAuth(<AuthorPage {...sharedProps} />)} />
        <Route path="/genre/:name" element={requireAuth(<GenrePage  {...sharedProps} />)} />
        <Route path="/genre-books/:genre" element={requireAuth(<GenreBooks {...sharedProps} />)} />
        <Route path="/condition/:condition" element={requireAuth(<ConditionBooks {...sharedProps} />)} />
        <Route path="/sellbook"    element={requireAuth(<SellBook   {...sharedProps} />)} />
        <Route path="/cart"        element={requireAuth(<CartPage   {...sharedProps} />)} />
        <Route path="/wishlist"    element={requireAuth(<WishlistPage {...sharedProps} />)} />
        <Route path="/orders"      element={requireAuth(<OrdersPage  {...sharedProps} />)} />
        <Route path="/notifications" element={requireAuth(<NotificationsPage {...sharedProps} />)} />
        <Route path="/transaction/:id" element={requireAuth(<TransactionDetail {...sharedProps} />)} />
        <Route path="/admin"             element={requireAdmin(<AdminDashboard {...sharedProps} />)} />
        <Route path="/admin/users"       element={requireAdmin(<AdminUsers     {...sharedProps} />)} />
        <Route path="/admin/books"       element={requireAdmin(<AdminBooks     {...sharedProps} />)} />
        <Route path="/admin/authors"     element={requireAdmin(<AdminAuthors   {...sharedProps} />)} />
        <Route path="/admin/transactions" element={requireAdmin(<AdminTransactions {...sharedProps} />)} />
        <Route path="/admin/reports"     element={requireAdmin(<AdminReports   {...sharedProps} />)} />
        <Route path="/terms"          element={<TermsAndConditions {...sharedProps} />} />
        <Route path="/privacy"        element={<Privacy              {...sharedProps} />} />
        <Route path="/faq"            element={<FAQ                {...sharedProps} />} />
        <Route path="/blog"           element={<Blog               {...sharedProps} />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}