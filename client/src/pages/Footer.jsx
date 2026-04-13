import { useNavigate } from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate();

    return (
    <footer className="mt-16 bg-blue-950">
      <div className="grid grid-cols-3 gap-10 px-16 py-12 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-0.5 font-serif font-black text-2xl mb-3">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Power</span>
            <span className="text-white">Xchange</span>
          </div>
          <p className="text-blue-300 text-base leading-relaxed">
            A student-first platform to buy, sell, and rent textbooks with fellow students on your campus.
          </p>
        </div>
        <div>
          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase mb-4">Information</p>
          {["Privacy Policy", "Terms & Conditions", "Cancellation & Refund", "Account Deletion"].map(item => (
            <p key={item} className="text-blue-300 text-base mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">{item}</p>
          ))}
        </div>
        <div>
          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase mb-4">Resources</p>
          {["FAQ", "Partner With Us", "Blog", "Contact Us"].map(item => (
            <p key={item} className="text-blue-300 text-base mb-2.5 cursor-pointer hover:text-cyan-300 transition-colors">{item}</p>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center">
        <p className="text-sm text-blue-400/60">© 2025 PowerXchange. All rights reserved.</p>
      </div>
    </footer>
  );
}