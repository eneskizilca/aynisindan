'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || '');

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Ayarlar</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Profil ve hesap bilgilerinizi yönetin.
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="card p-6">
          <h2 className="text-[#231916] font-bold text-lg mb-4">Profil Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#231916] mb-1.5">
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#231916] mb-1.5">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="input-field bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#231916] mb-1.5">
                Rol
              </label>
              <div className="px-4 py-3 rounded-lg border border-[#ddc0b9] bg-[#fff8f6] text-[#56423d]">
                {user?.role === 'ARTISAN' ? 'Zanaatkâr' : 'Müşteri'}
              </div>
            </div>
            <button className="btn-primary">
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
