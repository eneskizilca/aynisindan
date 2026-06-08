'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ordersApi, Order } from '@/services/api';
import OrderCard from '@/components/OrderCard';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'ARTISAN') {
      router.replace('/workspace');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersApi.getMyOrders();
        setOrders(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Siparişler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const viewMode = 'customer';

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <div>
          <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Siparişlerim</h1>
          <p className="text-[#56423d] text-sm mt-1">
            Mevcut projelerinizi yönetin ve Param-Güvende durumlarınızı takip edin.
          </p>
        </div>
        <Link href="/orders/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <PlusIcon className="w-4 h-4" />
          Yeni Sipariş
        </Link>
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
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz sipariş yok</h3>
          <p className="text-[#56423d] text-sm mb-6">
            İlk özel siparişinizi oluşturun.
          </p>
          <Link href="/orders/new" className="btn-primary">
            Yeni Sipariş Oluştur
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
