'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BellIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e9d6d1] px-8">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Aynısından" width={40} height={40} className="object-contain" />
          <span className="text-[#de6b48] font-bold text-xl tracking-tight">Aynısından</span>
        </Link>

        {/* Navigasyon Linkleri */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/marketplace" className="text-[#56423d] text-sm font-medium hover:text-[#de6b48] transition-colors">
            Pazar Yeri
          </Link>
          <Link href="/artisans" className="text-[#56423d] text-sm font-medium hover:text-[#de6b48] transition-colors">
            Zanaatkârlar
          </Link>
          <Link href="/about" className="text-[#56423d] text-sm font-medium hover:text-[#de6b48] transition-colors">
            Hakkında
          </Link>
        </nav>

        {/* Sağ taraf */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button className="text-[#56423d] hover:text-[#de6b48] transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="text-[#56423d] hover:text-[#de6b48] transition-colors">
                <ShoppingBagIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-[#feeae5] flex items-center justify-center hover:bg-[#f8e4df] transition-colors"
                title="Çıkış Yap"
              >
                <UserCircleIcon className="w-6 h-6 text-[#de6b48]" />
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="btn-outline-primary text-sm py-2">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                Başla
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
