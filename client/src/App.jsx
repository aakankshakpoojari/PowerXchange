import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import  Buybook from "./pages/Buybook";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ add this

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buybook" element={<Buybook />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;