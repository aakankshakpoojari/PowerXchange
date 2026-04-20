import { useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate();

    return (
    <div className="sticky top-[100vh]">
      <footer className="bg-blue-950">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-12 py-12 max-w-6xl mx-auto">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-0.5 font-serif font-black text-2xl mb-3">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Power</span>
              <span className="text-white">Xchange</span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">
              A student-first platform to buy, sell, and rent textbooks with fellow students on your campus.
            </p>
          </div>

          {/* Information */}
          <div>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Information</p>
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms & Conditions", path: "/terms" },
            ].map(item => (
              <p key={item.label} onClick={() => navigate(item.path)}
                className="text-blue-300 text-sm mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
                {item.label}
              </p>
            ))}
          </div>

          {/* Resources */}
          <div>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Resources</p>
            {[
              { label: "FAQ", path: "/faq" },
              { label: "Blog", path: "/blog" },
            ].map(item => (
              <p key={item.label} onClick={() => navigate(item.path)}
                className="text-blue-300 text-sm mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
                {item.label}
              </p>
            ))}
          </div>

          {/* Contact Us */}
          <div>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Contact Us</p>
            {[
              "atmikanayak021206@gmail.com",
              "jatharva1701@gmail.com",
              "aakankshakpoojari265@gmail.com",
            ].map(email => (
              <a key={email} href={`mailto:${email}`}
                className="block text-blue-300 text-xs mb-2.5 hover:text-cyan-300 transition-colors break-all leading-relaxed">
                {email}
              </a>
            ))}
          </div>

        </div>
        <div className="border-t border-white/10 py-4 text-center">
          <p className="text-sm text-blue-400/60">© 2026cd client
           PowerXchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}