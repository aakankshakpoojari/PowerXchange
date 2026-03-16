import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import  Buybook from "./pages/Buybook";
import HomePage from "./pages/HomePage";
// import Browse   from "./pages/Browse";    // or wherever Browse.jsx lives
import SellBook from "./pages/Sellbook";  // or wherever SellBook.jsx lives

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buybook" element={<Buybook />} />
        <Route path="/home" element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        {/* <Route path="/browse"   element={<Browse />} /> */}
        <Route path="/sellbook" element={<SellBook />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;