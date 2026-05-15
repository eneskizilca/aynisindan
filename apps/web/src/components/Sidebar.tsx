'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activePage?: 'orders' | 'quotes' | 'feed' | 'settings';
}

export default function Sidebar({ activePage }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { key: 'orders', label: 'Siparişler', href: '/dashboard/orders', Icon: ShoppingBagIcon },
    { key: 'quotes', label: 'Teklifler', href: '/dashboard/quotes', Icon: ChatBubbleLeftRightIcon },
    { key: 'feed', label: 'Akış', href: '/dashboard/feed', Icon: Squares2X2Icon },
    { key: 'settings', label: 'Ayarlar', href: '/dashboard/settings', Icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#fff8f6] border-r border-[#e9d6d1] min-h-screen py-6 px-3">
      {/* Marka */}
      <div className="px-3 mb-6 flex items-center gap-3">
        <Image src="/logo.svg" alt="Aynısından" width={48} height={48} className="object-contain flex-shrink-0" />
        <div>
          <h2 className="text-[#de6b48] font-bold text-base leading-tight">
            Aynısından
          </h2>
          <p className="text-[#56423d] text-xs mt-0.5">isteyenlerin pazarı!</p>
        </div>
      </div>

      {/* Yeni Sipariş Butonu */}
      <Link
        href="/dashboard/orders/new"
        className="btn-primary flex items-center justify-center gap-2 mx-2 mb-3 text-sm"
      >
        <PlusIcon className="w-4 h-4" />
        Yeni Sipariş
      </Link>

      {/* Navigasyon */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {navItems.map(({ key, label, href, Icon }) => (
          <Link
            key={key}
            href={href}
            className={activePage === key ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Alt Bölüm */}
      <div className="flex flex-col gap-1 mt-4 border-t border-[#e9d6d1] pt-4">
        <button className="sidebar-link w-full">
          <QuestionMarkCircleIcon className="w-5 h-5" />
          Yardım Merkezi
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
