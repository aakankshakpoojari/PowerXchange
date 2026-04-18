import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PrivacyPolicy({ isLoggedIn, onLogout, cart, wishlist }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} cart={cart} wishlist={wishlist} />

      <div className="max-w-3xl mx-auto px-6 py-12 pb-20">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="font-serif font-black text-4xl text-blue-950 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-slate-700 text-base leading-relaxed">

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">1. Information We Collect</h2>
            <p>When you register on PowerXchange, we collect your name, email address, college name, and phone number. When you list or purchase a book, we collect details about the transaction including the book information, price, and your contact details.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to facilitate transactions between buyers and sellers, send notifications about your listings and orders, improve the platform experience, and ensure the safety and integrity of the marketplace. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">3. Information Shared With Other Users</h2>
            <p>When you list a book, your name and college may be visible to other users. When a transaction is initiated, your contact details may be shared with the other party to facilitate the exchange. We limit this sharing to what is necessary for completing the transaction.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">4. Data Storage & Security</h2>
            <p>Your data is stored securely using Supabase, a trusted backend platform with industry-standard encryption. We take reasonable measures to protect your information from unauthorised access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">5. Cookies</h2>
            <p>We use session cookies to keep you logged in and to remember your preferences. We do not use tracking cookies or share cookie data with advertisers. You can disable cookies in your browser settings, though this may affect the functionality of the platform.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information at any time. You can update your profile details from your account settings. To request deletion of your account and associated data, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">7. Third-Party Services</h2>
            <p>We use Supabase for database and authentication services. Their privacy practices are governed by their own privacy policy. We do not integrate advertising networks or analytics services that track you across the web.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use after changes are posted constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-bold text-blue-950 text-lg mb-2">9. Contact</h2>
            <p>For privacy-related questions or data requests, contact us at any of the following:</p>
            <ul className="mt-2 space-y-1">
              {["atmikanayak021206@gmail.com", "jatharva1701@gmail.com", "aakankshakpoojari265@gmail.com"].map(email => (
                <li key={email}><a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></li>
              ))}
            </ul>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}