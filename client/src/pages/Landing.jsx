// function Landing() {
//   return (
//     <div className="min-h-screen bg-white">

//       {/* Navbar */}
//       <nav className="flex justify-between items-center px-10 py-5 shadow-sm">
//         <h1 className="text-2xl font-bold text-indigo-600">PowerXchange</h1>
//         <div className="flex gap-4">
//           <button className="text-gray-600 hover:text-indigo-600 font-medium">Login</button>
//           <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign Up</button>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="flex flex-col items-center text-center mt-24 px-4">
//         <h2 className="text-5xl font-bold text-gray-800 max-w-2xl leading-tight">
//           Buy, Sell & Rent Books with Fellow Students
//         </h2>
//         <p className="text-gray-500 mt-6 text-lg max-w-xl">
//           PowerXchange automatically matches you with students who have the exact book you need — at a fraction of the price.
//         </p>
//         <div className="flex gap-4 mt-8">
//           <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700">
//             Get Started
//           </button>
//           <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50">
//             Browse Books
//           </button>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="grid grid-cols-3 gap-8 px-20 mt-24">
//         <div className="text-center p-6 rounded-xl bg-indigo-50">
//           <div className="text-4xl mb-4">📚</div>
//           <h3 className="text-xl font-semibold text-gray-800">Post Your Books</h3>
//           <p className="text-gray-500 mt-2">List books you want to sell or rent in under a minute.</p>
//         </div>
//         <div className="text-center p-6 rounded-xl bg-indigo-50">
//           <div className="text-4xl mb-4">🤝</div>
//           <h3 className="text-xl font-semibold text-gray-800">Auto Matching</h3>
//           <p className="text-gray-500 mt-2">Get instantly matched with students who need your book.</p>
//         </div>
//         <div className="text-center p-6 rounded-xl bg-indigo-50">
//           <div className="text-4xl mb-4">💸</div>
//           <h3 className="text-xl font-semibold text-gray-800">Save Money</h3>
//           <p className="text-gray-500 mt-2">Buy second-hand books at a fraction of the original price.</p>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Landing




import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">PowerXchange</h1>
        <div className="flex gap-4">
          <button className="text-gray-600 hover:text-indigo-600 font-medium">Login</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign Up</button>
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-600 hover:text-indigo-600 font-medium"
          >
            My Profile
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mt-24 px-4">
        <h2 className="text-5xl font-bold text-gray-800 max-w-2xl leading-tight">
          Buy, Sell & Rent Books with Fellow Students
        </h2>
        <p className="text-gray-500 mt-6 text-lg max-w-xl">
          PowerXchange automatically matches you with students who have the exact book you need — at a fraction of the price.
        </p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/profile")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700"
          >
            Get Started
          </button>
          <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50">
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
    </div>
  );
}

export default Landing;