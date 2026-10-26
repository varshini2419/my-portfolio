import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maddala Varshini | Data Analyst Portfolio',
  description: 'Personal portfolio of Maddala Varshini, 3rd year B.Tech Computer Science & IT student at SRKR Engineering College, aspiring Data Analyst.',
  keywords: ['Maddala Varshini', 'Data Analyst', 'SRKR Engineering College', 'Power BI', 'SQL', 'Python', 'Portfolio'],
  authors: [{ name: 'Maddala Varshini' }],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#112D4E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth bg-[#F9F7F7] text-slate-900">
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-900 selection:bg-brand-100 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
