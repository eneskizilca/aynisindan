'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsApi, Payment } from '@/services/api';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  WalletIcon,
  BanknotesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const STATUS_LABELS: Record<string, string> = {
  HELD_IN_ESCROW: 'Havuzda Bekliyor',
  RELEASED_TO_ARTISAN: 'Zanaatkâra Aktarıldı',
  REFUNDED: 'İade Edildi',
};

const STATUS_CLASSES: Record<string, string> = {
  HELD_IN_ESCROW: 'bg-amber-50 text-amber-600',
  RELEASED_TO_ARTISAN: 'bg-green-50 text-green-700',
  REFUNDED: 'bg-red-50 text-red-600',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  HELD_IN_ESCROW: <ShieldCheckIcon className="w-3.5 h-3.5" />,
  RELEASED_TO_ARTISAN: <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />,
  REFUNDED: <ArrowUturnLeftIcon className="w-3.5 h-3.5" />,
};

export default function WalletPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentsApi.getMyPayments();
        setPayments(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Ödemeler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const isArtisan = user?.role === 'ARTISAN';

  const totalHeld = payments
    .filter((p) => p.status === 'HELD_IN_ESCROW')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReleased = payments
    .filter((p) => p.status === 'RELEASED_TO_ARTISAN')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <div className="text-center py-24">
          <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg inline-block">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Cüzdan</h1>
        <p className="text-[#56423d] text-sm mt-1">
          {isArtisan
            ? 'Kazançlarınız ve Param-Güvende bakiyeniz.'
            : 'Param-Güvende ödemeleriniz ve işlem geçmişi.'}
        </p>
      </div>

      {/* ─── Özet Kartları ──────────────────────────────────────── */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {isArtisan ? (
            <>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalHeld.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">Havuzda Bekliyor</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalReleased.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">Kazanılan Toplam</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <ArrowUturnLeftIcon className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalRefunded.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">İade Edilen</p>
              </div>
            </>
          ) : (
            <>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#feeae5] rounded-xl flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-[#de6b48]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalHeld.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">Havuzda Bekleyen</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalReleased.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">Serbest Bırakılan</p>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <ArrowUturnLeftIcon className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#231916]">
                  ₺{totalRefunded.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-[#56423d] mt-1">İade Edilen</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Ödeme Listesi ──────────────────────────────────────── */}
      {payments.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-8 h-8 text-[#de6b48]" />
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz ödeme yok</h3>
          <p className="text-[#56423d] text-sm mb-6">
            {isArtisan
              ? 'Kabul edilen tekliflerinizin ödemeleri burada görünecek.'
              : 'Kabul ettiğiniz teklifler için Param-Güvende ödemesi yapın.'}
          </p>
          <Link
            href={isArtisan ? '/feed' : '/orders'}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isArtisan ? 'İş Fırsatlarına Git' : 'Siparişlerime Git'}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-[#e9d6d1]">
            <h2 className="font-bold text-[#231916] text-lg">İşlem Geçmişi</h2>
          </div>
          <div className="divide-y divide-[#e9d6d1]">
            {payments.map((p) => (
              <div key={p.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STATUS_CLASSES[p.status]}`}>
                    {STATUS_ICONS[p.status]}
                  </div>
                  <div>
                    <p className="font-medium text-[#231916]">
                      {STATUS_LABELS[p.status] || p.status}
                    </p>
                    <p className="text-xs text-[#8a726b]">
                      {new Date(p.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#231916]">
                    ₺{p.amount.toLocaleString('tr-TR')}
                  </p>
                  <Link
                    href={`/orders/${p.orderId}`}
                    className="text-xs text-[#de6b48] hover:underline"
                  >
                    Siparişi Gör →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
