'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order } from '@/services/api';
import Link from 'next/link';
import {
  ClockIcon,
  UserIcon,
  PhotoIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function FeedPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersApi.getAllPendingOrders();
        setOrders(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'İş fırsatları yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">İş Fırsatları</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Teklif verebileceğiniz açık siparişler.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg inline-block">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Şu an açık sipariş yok</h3>
          <p className="text-[#56423d] text-sm">
            Yeni siparişler eklendiğinde burada görünecek.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {orders.map((order) => (
            <FeedCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedCard({ order }: { order: Order }) {
  return (
    <div className="card flex flex-col overflow-hidden group">
      {/* Görsel */}
      <div className="relative w-full aspect-[4/3] bg-[#feeae5] overflow-hidden">
        {order.referenceImageUrl ? (
          <img
            src={order.referenceImageUrl}
            alt={order.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 text-[#de6b48]/40" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="status-badge status-pending text-xs">
            <ClockIcon className="w-3.5 h-3.5 inline mr-1" />
            Teklif Bekliyor
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-semibold text-[#231916] text-base leading-snug line-clamp-2 group-hover:text-[#de6b48] transition-colors">
          {order.title}
        </h3>
        <p className="text-[#56423d] text-sm mt-2 leading-relaxed line-clamp-3 flex-1">
          {order.description}
        </p>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#e9d6d1]">
          <div className="w-7 h-7 rounded-full bg-[#f2ded9] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4 text-[#de6b48]" />
          </div>
          <span className="text-xs text-[#56423d] truncate">
            {order.customerName || 'Müşteri'}
          </span>
          <span className="text-xs text-[#8a726b] ml-auto whitespace-nowrap">
            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>

        <Link
          href={`/orders/${order.id}`}
          className="mt-4 w-full btn-primary text-center text-sm flex items-center justify-center gap-2"
        >
          Teklif Ver
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
