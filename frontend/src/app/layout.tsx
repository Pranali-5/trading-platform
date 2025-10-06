import type { Metadata } from 'next';
import './globals.css';
import '../styles/tokens.css';
import { ReduxProvider } from '@/store/Provider';

export const metadata: Metadata = {
  title: 'Trading Platform',
  description: 'Online Stock Trading & Investment Platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}


