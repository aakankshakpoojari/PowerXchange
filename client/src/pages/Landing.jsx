import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Landing({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-24 px-4">
          <h2 className="text-5xl font-bold text-gray-800 max-w-2xl leading-tight">
            Buy, Sell & Rent Books with Fellow Students
          </h2>
          <p className="text-gray-500 mt-6 text-lg max-w-xl">
            PowerXchange automatically matches you with students who have the exact book you need — at a fraction of the price.
          </p>
          <div className="flex gap-4 mt-8">
            {/* Get Started — only show when NOT logged in */}
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/signup")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700"
              >
                Get Started
              </button>
            )}
            <button
              onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50"
            >
              Browse Books
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-3 gap-8 px-20 mt-24">
          <div className="text-center p-6 rounded-xl bg-indigo-50">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800">Post Your Books</h3>
            <p className="text-gray-500 mt-2">List books you want to sell or rent in under a minute.</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-indigo-50">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800">Auto Matching</h3>
            <p className="text-gray-500 mt-2">Get instantly matched with students who need your book.</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-indigo-50">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-gray-800">Save Money</h3>
            <p className="text-gray-500 mt-2">Buy second-hand books at a fraction of the original price.</p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Landing;