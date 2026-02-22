import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Paham Bareng - Karena Usahamu Mencari Kebenaran, Takkan Pernah Disia-siakan',
  description: 'Belajar agama dari nol dengan peta jalan yang jelas. Di paham-bareng.id, kita merayakan setiap prosesmu. Pilih peta belajarmu, mari melangkah pelan-pelan tanpa takut dihakimi.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf8f5] text-dark-900 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { 
                background: '#6b8e6f', 
                color: '#fff', 
                borderRadius: '12px',
                padding: '12px 16px'
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
