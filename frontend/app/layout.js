import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: 'MovieMood-AI | Deep Learning Sentiment Analyzer',
  description: 'Real-time IMDb movie review sentiment analysis powered by PyTorch Recurrent Neural Network (RNN).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-[family-name:var(--font-geist)] bg-[#0d141d] text-[#dce3f0] antialiased min-h-screen selection:bg-[#2fd9f4]/20 selection:text-[#8aebff]`}>
        {children}
      </body>
    </html>
  );
}
