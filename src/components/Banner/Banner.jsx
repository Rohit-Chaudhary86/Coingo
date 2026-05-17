import currencyStore from '../../state/store';

function Banner() {
  const { currency } = currencyStore();
  const symbol = currency === 'inr' ? '₹' : '$';

  const stats = [
    { label: 'Coins Tracked', value: '10,000+' },
    { label: 'Market Updates', value: 'Live' },
    { label: 'Currencies', value: '2' },
    { label: 'AI Powered', value: 'Yes ✦' },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-6 py-16 text-center relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
        AI-Powered Crypto Intelligence
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
        Track Crypto,{' '}
        <span className="text-yellow-400">Smarter.</span>
      </h1>

      <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
        Real-time prices, market data, and an AI analyst that answers your questions about any coin — instantly.
      </p>

      {/* Stats row */}
      <div className="flex flex-wrap justify-center gap-8 mt-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Banner;