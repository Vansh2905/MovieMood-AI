'use client';

import { useState, useRef } from 'react';
import Header from './components/Header';

const SAMPLE_REVIEWS = [
  {
    title: "Masterpiece",
    text: "This movie was an absolute masterpiece! Outstanding direction, gripping storyline, and incredible lead actor performance.",
  },
  {
    title: "Complete Disaster",
    text: "Terrible film. Horrible pacing, predictable plot, awful acting, and super boring. Waste of time and money.",
  },
  {
    title: "Nostalgic Classic",
    text: "Wonderful cinematography and subtle humor. A delightful visual experience that captures pure emotion.",
  }
];

export default function Home() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  const handleAnalyze = async (textToAnalyze = review) => {
    const targetText = textToAnalyze.trim();
    if (!targetText) {
      setError('Please enter a movie review to analyze.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: targetText }),
      });

      if (!response.ok) throw new Error(`Server returned status ${response.status}`);

      const data = await response.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the analysis server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReview('');
    setResult(null);
    setError('');
  };

  const handleSampleClick = (sampleText) => {
    setReview(sampleText);
    handleAnalyze(sampleText);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d141d] text-[#dce3f0]">
      <Header />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-[120px] flex flex-col items-center gap-16">

        {/* Hero */}
        <div className="text-center space-y-5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2fd9f4]/20 bg-[#2fd9f4]/5">
            <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#2fd9f4] tracking-[0.05em]">
              RNN · PYTORCH · IMDB
            </span>
          </div>
          <h1 className="text-[72px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#dce3f0]">
            Movie Sentiment<br />
            <span className="text-[#2fd9f4]">Analyzer</span>
          </h1>
          <p className="text-[18px] text-[#bbc9cd] leading-[28px]">
            Paste any movie review and let the RNN model determine its sentiment in real time.
          </p>
        </div>

        {/* Input Card — Glassmorphism */}
        <div className="w-full max-w-2xl rounded-lg border border-white/[0.08] bg-[#192029] p-6 space-y-5">

          {/* Card header */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2fd9f4] shadow-[0_0_6px_rgba(47,217,244,0.8)]" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#859397] tracking-[0.05em] uppercase">
              Input Review
            </span>
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="e.g. The film had amazing visual effects and a captivating plot..."
            rows={6}
            className="w-full bg-[#151c25] border border-[#3c494c] rounded-[4px] p-4 text-[16px] text-[#dce3f0] placeholder-[#859397] leading-[24px] focus:outline-none focus:border-[#2fd9f4] focus:shadow-[0_0_0_2px_rgba(47,217,244,0.15)] transition-all resize-none font-[family-name:var(--font-geist)]"
          />

          {error && (
            <p className="text-[#ffb4ab] text-[13px] font-medium tracking-[0.05em]">{error}</p>
          )}

          {/* Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#859397] tracking-[0.05em] uppercase mr-1">
              Try:
            </span>
            {SAMPLE_REVIEWS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(sample.text)}
                className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#2fd9f4] border border-[#2fd9f4]/30 bg-[#2fd9f4]/5 hover:bg-[#2fd9f4]/10 px-3 py-1.5 rounded-full tracking-[0.05em] transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {review && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-[13px] font-medium text-[#859397] hover:text-[#dce3f0] border border-white/[0.08] hover:border-white/[0.15] rounded-[4px] transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !review.trim()}
              className="px-6 py-2.5 bg-[#2fd9f4] text-[#00363e] rounded-[4px] text-[14px] font-semibold hover:shadow-[0_0_12px_rgba(47,217,244,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div ref={resultRef} className="w-full max-w-2xl rounded-lg border border-white/[0.08] bg-[#192029] p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">

            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${result.sentiment === 'Positive' ? 'bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.7)]' : 'bg-[#ffb4ab] shadow-[0_0_6px_rgba(255,180,171,0.7)]'}`} />
              <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#859397] tracking-[0.05em] uppercase">
                Analysis Result
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className={`text-[32px] font-medium leading-[40px] tracking-[-0.02em] ${result.sentiment === 'Positive' ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>
                  {result.sentiment}
                </p>
                <p className="text-[13px] text-[#859397] mt-1">
                  {result.sentiment === 'Positive' ? 'The model detected a positive tone.' : 'The model detected a negative tone.'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-[family-name:var(--font-geist-mono)] text-[32px] font-medium leading-[40px] tracking-[-0.02em] text-[#2fd9f4]">
                  {result.confidence_percentage}%
                </p>
                <p className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#859397] tracking-[0.05em] uppercase mt-1">
                  Confidence
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="h-px bg-white/[0.04] rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${result.sentiment === 'Positive' ? 'bg-[#4edea3]' : 'bg-[#ffb4ab]'}`}
                style={{ width: `${result.confidence_percentage}%` }}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center">
        <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#859397] tracking-[0.05em] uppercase">
          MovieMood AI · PyTorch RNN
        </span>
      </footer>
    </div>
  );
}
