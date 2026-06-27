import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Graduation Memory Vault — Class of 2024',
  description: 'A forever home for our most precious graduation memories, friendships, and stories.',
  keywords: ['graduation', 'memories', 'CSE', 'class of 2024', 'friendships'],
  openGraph: {
    title: 'Graduation Memory Vault',
    description: 'Preserve your graduation memories forever',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-cream text-ink">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background:  '#2C1810',
              color:       '#F5F0E8',
              border:      '1px solid rgba(201,150,44,0.4)',
              fontFamily:  '"Lora", Georgia, serif',
              fontSize:    '14px',
              borderRadius: '2px',
              padding:     '12px 20px',
              boxShadow:   '0 8px 30px rgba(44,24,16,0.3)',
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
