'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-[20px] bg-[#0d141d]/80">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2fd9f4]/10 border border-[#2fd9f4]/20 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#2fd9f4] shadow-[0_0_8px_rgba(47,217,244,0.8)]" />
          </div>
          <span className="text-[16px] font-medium tracking-[-0.01em] text-[#dce3f0]">
            MovieMood <span className="text-[#2fd9f4]">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#3c494c] bg-[#192029]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.7)]" />
          <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#bbc9cd] tracking-[0.05em]">
            MODEL ONLINE
          </span>
        </div>
      </div>
    </header>
  );
}
