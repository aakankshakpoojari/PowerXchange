import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SPECIALTIES = [
  {
    icon: "📖",
    title: "Wide Selection",
    description: "Browse thousands of textbooks, novels, and reference books from students across your campus.",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGlow: "shadow-violet-500/50",
  },
  {
    icon: "💰",
    title: "Best Prices",
    description: "Get books at up to 70% off MRP. Direct deals with students mean no middleman fees.",
    color: "from-emerald-400 via-green-500 to-teal-500",
    bgGlow: "shadow-emerald-500/50",
  },
  {
    icon: "🔄",
    title: "Buy • Sell • Exchange",
    description: "Flexible options to buy, sell, or exchange books. Choose what works best for you.",
    color: "from-cyan-400 via-blue-500 to-indigo-500",
    bgGlow: "shadow-cyan-500/50",
  },
  {
    icon: "🛡️",
    title: "Trusted Community",
    description: "Verified college students only. Safe, secure, and built for students by students.",
    color: "from-orange-400 via-amber-500 to-yellow-500",
    bgGlow: "shadow-orange-500/50",
  },
  {
    icon: "⚡",
    title: "Instant Connection",
    description: "Connect directly with book owners. Chat, negotiate, and complete deals seamlessly.",
    color: "from-pink-400 via-rose-500 to-red-500",
    bgGlow: "shadow-pink-500/50",
  },
];

function Landing({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef(null);

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const nextSlide = () => {
    if (currentSlide >= SPECIALTIES.length - 1) {
      // Jump to first slide instantly after reaching the end
      setTimeout(() => {
        setCurrentSlide(0);
      }, 700);
    }
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide === 0) {
      setCurrentSlide(SPECIALTIES.length - 1);
    } else {
      goToSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mt-16 px-4">
          <h2 className="text-5xl font-bold text-gray-800 max-w-2xl leading-tight">
            Buy, Sell & Rent Books with Fellow Students
          </h2>
          <p className="text-gray-500 mt-6 text-lg max-w-xl">
            PowerXchange automatically matches you with students who have the exact book you need — at a fraction of the price.
          </p>
          <div className="flex gap-4 mt-8">
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </button>
            )}
            <button
              onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-all duration-300"
            >
              Browse Books
            </button>
          </div>
        </div>

        {/* Specialties Carousel */}
        <div className="mt-24 px-4">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-3">
            Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PowerXchange</span>?
          </h3>
          <p className="text-gray-500 text-center mb-12 text-lg">
            Everything you need to make book trading simple and affordable
          </p>

          <div className="relative max-w-[1600px] mx-auto">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-gray-200
                flex items-center justify-center text-gray-600 text-2xl font-bold
                hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-indigo-500/50
                transition-all duration-300 -ml-7"
              aria-label="Previous"
            >
              ‹
            </button>

            {/* Carousel Track */}
            <div ref={carouselRef} className="relative overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / 3)}%)`,
                }}
              >
                {SPECIALTIES.map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full md:w-[calc(100%/3)] px-3"
                  >
                    <div
                      className={`relative h-full p-10 rounded-3xl transition-all duration-700 ${
                        index === currentSlide
                          ? "scale-100 opacity-100"
                          : "scale-95 opacity-60"
                      }`}
                    >
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl`} />

                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-2xl opacity-40 rounded-3xl`} />

                      {/* Content */}
                      <div className="relative z-10 text-white">
                        {/* Icon Circle */}
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl mb-6 shadow-2xl border border-white/30">
                          {item.icon}
                        </div>

                        <h4 className="text-3xl font-bold mb-4 drop-shadow-lg">{item.title}</h4>
                        <p className="text-white/90 text-lg leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-gray-200
                flex items-center justify-center text-gray-600 text-2xl font-bold
                hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-indigo-500/50
                transition-all duration-300 -mr-7"
              aria-label="Next"
            >
              ›
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-10">
            {SPECIALTIES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative overflow-hidden rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-12 h-4"
                    : "w-4 h-4 hover:w-6"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${SPECIALTIES[index].color}`} />
              </button>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Landing;