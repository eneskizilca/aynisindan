'use client';
import Image from 'next/image';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type Role = 'CUSTOMER' | 'ARTISAN';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register({ fullName, email, password, role });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e9d6d1] shadow-sm p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Aynısından" width={100} height={100} className="object-contain" />
        </div>

        <h1 className="text-[#231916] font-bold text-2xl text-center mb-1">
          Hesap Oluştur
        </h1>
        <p className="text-[#56423d] text-sm text-center mb-7">
          Geleneksel el sanatlarının güvenli ağına katılın.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rol Seçici */}
          <div>
            <p className="text-[#231916] text-sm font-medium mb-2">
              Kayıt türünü seçin
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(['CUSTOMER', 'ARTISAN'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r.toLowerCase()}`}
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all duration-150 font-medium text-sm relative ${role === r
                      ? 'border-[#de6b48] bg-[#fff1ed] text-[#de6b48]'
                      : 'border-[#e9d6d1] bg-white text-[#56423d] hover:border-[#ddc0b9]'
                    }`}
                >
                  {role === r && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-[#de6b48] rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 12 12" className="w-3 h-3 fill-white">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                  {r === 'CUSTOMER' ? (
                    <ShoppingBagIcon className="w-7 h-7" />
                  ) : (
                    <WrenchScrewdriverIcon className="w-7 h-7" />
                  )}
                  {r === 'CUSTOMER' ? 'Müşteri' : 'Zanaatkâr'}
                </button>
              ))}
            </div>
          </div>

          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Ad Soyad
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726b]" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmet Yılmaz"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726b]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@ornek.com"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726b]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pl-10"
              />
            </div>
            <p className="text-[#8a726b] text-xs mt-1">En az 8 karakter olmalıdır.</p>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            id="submit-register"
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Hesap Oluşturuluyor…' : 'Hesap Oluştur'}
          </button>

          {/* Param-Güvende rozeti */}
          <div className="flex items-center justify-center gap-2 bg-[#fff1ed] rounded-xl py-3">
            <ShieldCheckIcon className="w-4 h-4 text-[#de6b48]" />
            <span className="text-sm text-[#56423d] font-medium">
              Param-Güvende Garantisi
            </span>
          </div>
        </form>

        <p className="text-center text-sm text-[#56423d] mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-[#de6b48] font-semibold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
