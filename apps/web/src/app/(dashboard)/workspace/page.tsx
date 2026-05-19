'use client';

import { useEffect, useState } from 'react';
import { ordersApi, returnsApi, Order, Return } from '@/services/api';
import Link from 'next/link';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'Üretiliyor',
  DELIVERED: 'Kargoya Verildi',
  COMPLETED: 'Tamamlandı',
};

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  DELIVERED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
};

export default function WorkspacePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingReturns, setPendingReturns] = useState<Return[]>([]);
  const [allReturns, setAllReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingReturn, setIsProcessingReturn] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [ordersRes, pendingReturnsRes, allReturnsRes] = await Promise.all([
        ordersApi.getMyOrders(),
        returnsApi.getMyReturns(),
        returnsApi.getAllReturns(),
      ]);
      const activeOrders = ordersRes.data.filter(
        (o) =>
          o.status === 'IN_PROGRESS' ||
          o.status === 'DELIVERED' ||
          o.status === 'COMPLETED'
      );
      setOrders(activeOrders);
      setPendingReturns(pendingReturnsRes.data);
      setAllReturns(allReturnsRes.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveReturn = async (returnId: string) => {
    setIsProcessingReturn(returnId);
    try {
      await returnsApi.approveReturn(returnId);
      await fetchData();
    } catch {
    } finally {
      setIsProcessingReturn(null);
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    setIsProcessingReturn(returnId);
    try {
      await returnsApi.rejectReturn(returnId);
      await fetchData();
    } catch {
    } finally {
      setIsProcessingReturn(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
          <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Atölyem</h1>
          <p className="text-[#56423d] text-sm mt-1">
            Kabul edilen siparişlerinizi yönetin ve teslimat yapın.
          </p>
        </div>

        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <TruckIcon className="w-8 h-8 text-[#de6b48]" />
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Aktif iş yok</h3>
          <p className="text-[#56423d] text-sm">
            Kabul edilen siparişleriniz burada görünecek.
          </p>
          <Link href="/feed" className="btn-primary mt-6 inline-block">
            İş Fırsatlarına Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Atölyem</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Kabul edilen siparişlerinizi yönetin ve teslimat yapın.
        </p>
      </div>

      {pendingReturns.length > 0 && (
        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#231916] mb-4 flex items-center gap-2">
            <ArrowPathIcon className="w-5 h-5 text-amber-500" />
            Bekleyen İade Talepleri ({pendingReturns.length})
          </h2>
          {pendingReturns.map((r) => (
            <div key={r.id} className="card p-5 border-2 border-amber-300 mb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#231916] text-base">{r.orderTitle}</h3>
                  <p className="text-[#56423d] text-sm mt-1">Müşteri: {r.customerName}</p>
                  <p className="text-[#56423d] text-sm italic mt-2 bg-amber-50 rounded-lg p-3">
                    &ldquo;{r.reason}&rdquo;
                  </p>
                  <p className="text-amber-600 font-bold text-lg mt-2">
                    İade Tutarı: ₺{r.amount.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-amber-200">
                <button
                  onClick={() => handleApproveReturn(r.id)}
                  disabled={isProcessingReturn === r.id}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isProcessingReturn === r.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      İadeyi Onayla
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRejectReturn(r.id)}
                  disabled={isProcessingReturn === r.id}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  {isProcessingReturn === r.id ? (
                    <div className="w-4 h-4 border-2 border-[#231916] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      Reddet
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {orders.map((order) => {
          const relatedReturn = pendingReturns.find(r => r.orderId === order.id);

          return (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const orderReturn = allReturns.find(r => r.orderId === order.id);
                      if (orderReturn?.status === 'REFUNDED') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <XMarkIcon className="w-3.5 h-3.5" />
                            İade Edildi
                          </span>
                        );
                      }
                      if (orderReturn?.status === 'REJECTED') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                            <XMarkIcon className="w-3.5 h-3.5" />
                            İade Reddedildi
                          </span>
                        );
                      }
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status === 'IN_PROGRESS' && <ClockIcon className="w-3.5 h-3.5" />}
                          {order.status === 'DELIVERED' && <TruckIcon className="w-3.5 h-3.5" />}
                          {order.status === 'COMPLETED' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="font-semibold text-[#231916] text-base leading-snug truncate">
                    {order.title}
                  </h3>
                  {order.customerName && (
                    <p className="text-[#56423d] text-sm mt-1">Müşteri: {order.customerName}</p>
                  )}
                  {order.agreedPrice != null && (
                    <p className="text-[#de6b48] font-bold text-lg mt-2">
                      ₺{order.agreedPrice.toLocaleString('tr-TR')}
                    </p>
                  )}

                  {(() => {
                    const orderReturn = allReturns.find(r => r.orderId === order.id);
                    if (!orderReturn) return null;
                    
                    if (orderReturn.status === 'REQUESTED') {
                      return (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <ArrowPathIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-700">İade Talebi Var</span>
                          </div>
                          <p className="text-xs text-amber-600 italic">
                            &ldquo;{orderReturn.reason}&rdquo;
                          </p>
                        </div>
                      );
                    }
                    if (orderReturn.status === 'REFUNDED') {
                      return (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-700">İade Edildi</span>
                          </div>
                          <p className="text-xs text-green-600">
                            ₺{orderReturn.amount.toLocaleString('tr-TR')} müşteriye iade edildi.
                          </p>
                        </div>
                      );
                    }
                    if (orderReturn.status === 'REJECTED') {
                      return (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <XMarkIcon className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-700">İade Reddedildi</span>
                          </div>
                          <p className="text-xs text-red-600 italic">
                            &ldquo;{orderReturn.reason}&rdquo;
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9d6d1]">
                <span className="text-xs text-[#8a726b]">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-[#de6b48] text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  Siparişi Gör
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
