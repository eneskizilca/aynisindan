'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  WalletIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const PinterestIcon = ({ className, ...props }: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`text-[#E60023] ${className || ''}`}
    {...props}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.17-.1-.95-.2-2.41.04-3.44.22-.94 1.4-5.97 1.4-5.97s-.36-.72-.36-1.78c0-1.67.97-2.92 2.18-2.92 1.03 0 1.53.77 1.53 1.69 0 1.04-.66 2.59-.99 4.03-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.26 3.78-5.52 0-2.89-2.07-4.9-5.03-4.9-3.43 0-5.44 2.57-5.44 5.22 0 1.03.4 2.15.9 2.75.1.12.11.23.08.35-.09.37-.29 1.18-.33 1.34-.05.22-.17.26-.39.16-1.46-.68-2.37-2.82-2.37-4.54 0-3.69 2.68-7.09 7.74-7.09 4.06 0 7.22 2.89 7.22 6.77 0 4.04-2.54 7.28-6.07 7.28-1.19 0-2.31-.62-2.69-1.35l-.73 2.79c-.26 1.02-.98 2.3-1.46 3.08C9.72 23.77 10.84 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
  </svg>
);

const CUSTOMER_NAV = [
  { key: 'explore', label: 'Keşfet', href: '/explore', Icon: GlobeAltIcon },
  { key: 'inspire', label: 'İlham Al', href: '/inspire', Icon: PinterestIcon },
  { key: 'orders', label: 'Siparişlerim', href: '/orders', Icon: ShoppingBagIcon },
  { key: 'messages', label: 'Mesajlar', href: '/messages', Icon: ChatBubbleLeftRightIcon },
];

const ARTISAN_NAV = [
  { key: 'feed', label: 'İş Fırsatları', href: '/feed', Icon: Squares2X2Icon },
  { key: 'my-quotes', label: 'Tekliflerim', href: '/my-quotes', Icon: DocumentTextIcon },
  { key: 'workspace', label: 'Atölyem', href: '/workspace', Icon: WrenchScrewdriverIcon },
  { key: 'portfolio', label: 'Portfolyo', href: '/portfolio', Icon: PhotoIcon },
  { key: 'wallet', label: 'Cüzdan', href: '/wallet', Icon: WalletIcon },
  { key: 'messages', label: 'Mesajlar', href: '/messages', Icon: ChatBubbleLeftRightIcon },
];

interface NavbarProps {
  activePage?: string;
}

export default function Navbar({ activePage }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isArtisan = user?.role === 'ARTISAN';
  const navItems = isArtisan ? ARTISAN_NAV : CUSTOMER_NAV;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* ─── Desktop Navbar ─────────────────────────────────────── */}
      <nav className="hidden lg:flex lg:items-center lg:justify-between h-16 px-6 bg-white border-b border-[#e9d6d1] sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.svg" alt="Aynısından" width={40} height={40} className="object-contain" />
          <div className="leading-tight">
            <h1 className="text-[#de6b48] font-bold text-base">Aynısından</h1>
            <p className="text-[#56423d] text-[10px] -mt-0.5">isteyenlerin pazarı!</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {navItems.map(({ key, label, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                activePage === key
                  ? 'bg-[#fff1ed] text-[#de6b48]'
                  : 'text-[#56423d] hover:bg-[#fff8f6] hover:text-[#de6b48]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Sağ taraf */}
        <div className="flex items-center justify-end gap-3">
          {!isArtisan && (
            <Link href="/orders/new" className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              <PlusIcon className="w-4 h-4" />
              Yeni Sipariş
            </Link>
          )}

          {/* Profil Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#fff8f6] transition-colors cursor-pointer"
            >
              <UserCircleIcon className="w-6 h-6 text-[#56423d]" />
              <span className="text-base font-medium text-[#231916] max-w-32 truncate">
                {user?.fullName}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-[#56423d] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#e9d6d1] shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-[#e9d6d1]">
                  <p className="text-sm font-semibold text-[#231916] truncate">{user?.fullName}</p>
                  <p className="text-xs text-[#56423d] truncate">{user?.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isArtisan
                      ? 'bg-[#feeae5] text-[#de6b48]'
                      : 'bg-[#f2ded9] text-[#56423d]'
                  }`}>
                    {isArtisan ? 'Zanaatkâr' : 'Müşteri'}
                  </span>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-[#56423d] hover:bg-[#fff8f6] transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Ayarlar
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile Navbar ──────────────────────────────────────── */}
      <nav className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#e9d6d1]">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-[#fff8f6] transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-[#231916]" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-[#231916]" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Aynısından" width={32} height={32} className="object-contain" />
            <div className="leading-tight">
              <h1 className="text-[#de6b48] font-bold text-sm">Aynısından</h1>
              <p className="text-[#56423d] text-[9px] -mt-0.5">isteyenlerin pazarı!</p>
            </div>
          </Link>

          <div className="w-8" />
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#e9d6d1] bg-white px-4 py-3 space-y-1">
            {/* Profil */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-[#e9d6d1] mb-2">
              <UserCircleIcon className="w-8 h-8 text-[#56423d]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#231916] truncate">{user?.fullName}</p>
                <p className="text-xs text-[#56423d] truncate">{user?.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isArtisan
                  ? 'bg-[#feeae5] text-[#de6b48]'
                  : 'bg-[#f2ded9] text-[#56423d]'
              }`}>
                {isArtisan ? 'Zanaatkâr' : 'Müşteri'}
              </span>
            </div>

            {!isArtisan && (
              <Link
                href="/orders/new"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary flex items-center justify-center gap-2 w-full text-sm py-2.5 mb-2"
              >
                <PlusIcon className="w-4 h-4" />
                Yeni Sipariş
              </Link>
            )}

            {navItems.map(({ key, label, href, Icon }) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activePage === key
                    ? 'bg-[#fff1ed] text-[#de6b48]'
                    : 'text-[#56423d] hover:bg-[#fff8f6]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}

            <div className="border-t border-[#e9d6d1] pt-2 mt-2 space-y-1">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#56423d] hover:bg-[#fff8f6] transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Ayarlar
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
