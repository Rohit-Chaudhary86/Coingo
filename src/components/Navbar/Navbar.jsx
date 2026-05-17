import { useNavigate, useLocation } from 'react-router-dom';
import currencyStore from '../../state/store';

function Navbar() {
  const { currency, setCurrency } = currencyStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: "/insights", label: "Insights" },
    { path: "/compare", label: "Compare" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/ask", label: "Ask AI" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">

      <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group">
        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black text-sm">C</div>
        <span className="text-white font-bold text-xl group-hover:text-yellow-400 transition-colors">CoinGo</span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              location.pathname === link.path
                ? "bg-yellow-400/10 text-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Currency Toggle */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setCurrency('usd')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${currency === 'usd' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
        >
          $ USD
        </button>
        <button
          onClick={() => setCurrency('inr')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${currency === 'inr' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
        >
          ₹ INR
        </button>
      </div>
    </div>
  );
}

export default Navbar;