'use client';

import { Order } from '@/services/api';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const DURUM_ETIKETLERI: Record<string, string> = {
  PENDING: 'BEKLEMEDE',
  IN_PROGRESS: 'DEVAM EDİYOR',
  DELIVERED: 'TESLİM EDİLDİ',
  COMPLETED: 'TAMAMLANDI',
  CANCELLED: 'İPTAL EDİLDİ',
};

const DURUM_SINIFLARI: Record<string, string> = {
  PENDING: 'status-badge status-pending',
  IN_PROGRESS: 'status-badge status-in-progress',
  DELIVERED: 'status-badge status-delivered',
  COMPLETED: 'status-badge status-completed',
  CANCELLED: 'status-badge status-cancelled',
};

function ParamGuvendeRozeti({ status }: { status: string }) {
  if (status === 'IN_PROGRESS' || status === 'DELIVERED') {
    return (
      <span className="flex items-center gap-1 text-xs text-[#de6b48] font-medium">
        <ShieldCheckIcon className="w-3.5 h-3.5" />
        Ödeme Param-Güvende&apos;de güvende
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
        <ClockIcon className="w-3.5 h-3.5" />
        Param-Güvende yatırımı bekleniyor
      </span>
    );
  }
  if (status === 'COMPLETED') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Ödeme Serbest Bırakıldı
      </span>
    );
  }
  return null;
}

interface OrderCardProps {
  order: Order;
  viewMode?: 'customer' | 'artisan';
}

export default function OrderCard({ order, viewMode = 'customer' }: OrderCardProps) {
  const actionLabel =
    order.status === 'PENDING'
      ? 'Teklifi İncele →'
      : order.status === 'COMPLETED'
        ? 'Makbuzu Gör'
        : 'Detayları Gör →';

  return (
    <div className="card flex gap-5 p-5">
      {/* Görsel */}
      {order.referenceImageUrl ? (
        <img
          src={order.referenceImageUrl}
          alt={order.title}
          className="w-40 h-36 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-40 h-36 bg-[#feeae5] rounded-lg flex-shrink-0 flex items-center justify-center text-[#de6b48] text-xs font-medium">
          Görsel Yok
        </div>
      )}

      {/* İçerik */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-[#231916] text-lg leading-snug">
              {order.title}
            </h3>
            <span className={DURUM_SINIFLARI[order.status] || 'status-badge'}>
              {DURUM_ETIKETLERI[order.status] || order.status}
            </span>
          </div>
          <p className="text-[#56423d] text-sm leading-relaxed line-clamp-2">
            {order.description}
          </p>
          {order.artisanName && (
            <p className="text-[#56423d] text-xs mt-1">
              Zanaatkâr: {order.artisanName}
            </p>
          )}
          {order.customerName && viewMode === 'artisan' && (
            <p className="text-[#56423d] text-xs mt-1">
              Müşteri: {order.customerName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <ParamGuvendeRozeti status={order.status} />
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="text-[#de6b48] text-sm font-semibold hover:underline"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
