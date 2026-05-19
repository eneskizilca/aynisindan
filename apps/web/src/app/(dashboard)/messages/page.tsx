'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Mesajlar</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Kabul edilen siparişleriniz için zanaatkâr/müşteri ile iletişim.
        </p>
      </div>

      <div className="text-center py-24">
        <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✉️</span>
        </div>
        <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz mesaj yok</h3>
        <p className="text-[#56423d] text-sm">
          Kabul edilen siparişleriniz için mesajlaşma burada görünecek.
        </p>
      </div>
    </div>
  );
}
