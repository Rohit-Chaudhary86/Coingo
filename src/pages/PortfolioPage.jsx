import { useState } from "react";
import { useNavigate } from "react-router-dom";
import currencyStore from "../state/store";

function PortfolioPage() {
  const navigate = useNavigate();
  const { currency } = currencyStore();
  const symbol = currency === "inr" ? "₹" : "$";
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ risk: "", goal: "", horizon: "", amount: "" });
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function generateSuggestion() {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 800,
            messages: [
              {
                role: "system",
                content: `You are a crypto portfolio advisor. Respond ONLY with valid JSON. No markdown.`,
              },
              {
                role: "user",
                content: `Create a personalized crypto portfolio suggestion based on:
- Risk tolerance: ${answers.risk}
- Investment goal: ${answers.goal}
- Time horizon: ${answers.horizon}
- Investment amount: ${symbol}${answers.amount}

Return JSON:
{
  "profileName": "e.g. Conservative Investor",
  "summary": "2 sentence description of this portfolio strategy",
  "allocations": [
    { "coin": "Bitcoin", "symbol": "BTC", "percentage": 40, "reason": "1 sentence" },
    { "coin": "Ethereum", "symbol": "ETH", "percentage": 30, "reason": "1 sentence" },
    { "coin": "coin name", "symbol": "SYM", "percentage": 20, "reason": "1 sentence" },
    { "coin": "coin name", "symbol": "SYM", "percentage": 10, "reason": "1 sentence" }
  ],
  "riskWarning": "1 sentence specific risk warning for this profile",
  "tip": "1 actionable tip for this type of investor"
}

Only return valid JSON.`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setSuggestion(JSON.parse(clean));
      setStep(3);
    } catch {
      setSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  }

  const colors = ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-purple-400", "bg-pink-400"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2">
        ← Back to market
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold">AI</div>
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Builder</h1>
          <p className="text-gray-400 text-sm">AI-powered portfolio suggestion based on your profile</p>
        </div>
      </div>

      {/* Step 1 — Questions */}
      {step === 1 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Risk Tolerance</label>
            <div className="flex gap-2 flex-wrap">
              {["Conservative", "Moderate", "Aggressive"].map((r) => (
                <button
                  key={r}
                  onClick={() => setAnswers({ ...answers, risk: r })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    answers.risk === r
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "border-gray-600 text-gray-300 hover:border-yellow-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Investment Goal</label>
            <div className="flex gap-2 flex-wrap">
              {["Long-term wealth", "Short-term gains", "Passive income", "Learning & experimenting"].map((g) => (
                <button
                  key={g}
                  onClick={() => setAnswers({ ...answers, goal: g })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    answers.goal === g
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "border-gray-600 text-gray-300 hover:border-yellow-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Time Horizon</label>
            <div className="flex gap-2 flex-wrap">
              {["Less than 1 year", "1-3 years", "3-5 years", "5+ years"].map((h) => (
                <button
                  key={h}
                  onClick={() => setAnswers({ ...answers, horizon: h })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    answers.horizon === h
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "border-gray-600 text-gray-300 hover:border-yellow-400"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Investment Amount ({symbol})</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={answers.amount}
              onChange={(e) => setAnswers({ ...answers, amount: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!answers.risk || !answers.goal || !answers.horizon || !answers.amount}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-40"
          >
            Build My Portfolio →
          </button>
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-white text-xl font-bold mb-2">Ready to build your portfolio</h2>
          <div className="bg-gray-900 rounded-xl p-4 text-left mb-6 flex flex-col gap-2">
            {[
              { label: "Risk", value: answers.risk },
              { label: "Goal", value: answers.goal },
              { label: "Horizon", value: answers.horizon },
              { label: "Amount", value: `${symbol}${Number(answers.amount).toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all">
              Edit
            </button>
            <button
              onClick={generateSuggestion}
              disabled={isLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Building...
                </span>
              ) : "Generate Portfolio"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Results */}
      {step === 3 && suggestion && (
        <div className="flex flex-col gap-5">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Investor Profile</div>
            <div className="text-white text-2xl font-bold mb-2">{suggestion.profileName}</div>
            <p className="text-gray-300 text-sm">{suggestion.summary}</p>
          </div>

          {/* Pie chart visual */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5">
            <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-4">Portfolio Allocation</div>
            <div className="flex gap-2 h-8 rounded-xl overflow-hidden mb-4">
              {suggestion.allocations?.map((a, i) => (
                <div
                  key={i}
                  className={`${colors[i]} flex items-center justify-center text-xs font-bold text-black`}
                  style={{ width: `${a.percentage}%` }}
                >
                  {a.percentage > 10 ? `${a.percentage}%` : ""}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {suggestion.allocations?.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-sm ${colors[i]} flex-shrink-0 mt-1`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-sm">{a.coin} <span className="text-gray-400 text-xs">{a.symbol}</span></span>
                      <span className="text-yellow-400 font-bold text-sm">{a.percentage}%</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{a.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-4">
            <div className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">⚠ Risk Warning</div>
            <p className="text-gray-300 text-sm">{suggestion.riskWarning}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">💡 Pro Tip</div>
            <p className="text-gray-300 text-sm">{suggestion.tip}</p>
          </div>

          <p className="text-center text-gray-500 text-xs">AI suggestion only. Not financial advice. Always do your own research.</p>

          <button onClick={() => { setStep(1); setSuggestion(null); setAnswers({ risk: "", goal: "", horizon: "", amount: "" }); }}
            className="mx-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;