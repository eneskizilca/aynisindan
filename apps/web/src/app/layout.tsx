import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Aynısından isteyenlerin pazarı!',
  description:
    'Özel el yapımı eserler için usta zanaatkârlarla buluşun. Güvenli Param-Güvende ödeme garantisi.',
  keywords: ['zanaatkâr', 'el işi', 'özel tasarım', 'mobilya', 'Param-Güvende', 'pazar yeri'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
