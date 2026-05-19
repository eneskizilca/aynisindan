'use client';
import Image from 'next/image';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      router.push('/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'E-posta veya şifre hatalı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e9d6d1] shadow-sm p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Aynısından" width={100} height={100} className="object-contain" />
        </div>

        <h1 className="text-[#231916] font-bold text-2xl text-center mb-1">
          Tekrar Hoş Geldiniz
        </h1>
        <p className="text-[#56423d] text-sm text-center mb-7">
          Aynısından hesabınıza giriş yapın.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            id="submit-login"
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Giriş Yapılıyor…' : 'Giriş Yap'}
          </button>

          <div className="flex items-center justify-center gap-2 bg-[#fff1ed] rounded-xl py-3">
            <ShieldCheckIcon className="w-4 h-4 text-[#de6b48]" />
            <span className="text-sm text-[#56423d] font-medium">
              Param-Güvende Garantisi
            </span>
          </div>
        </form>

        <p className="text-center text-sm text-[#56423d] mt-6">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-[#de6b48] font-semibold hover:underline">
            Hesap Oluştur
          </Link>
        </p>
      </div>
    </div>
  );
}
