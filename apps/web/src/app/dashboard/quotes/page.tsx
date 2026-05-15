'use client';

import { useEffect, useState } from 'react';
import { quotesApi, ordersApi, Quote, Order } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import QuoteCard from '@/components/QuoteCard';

interface QuoteWithOrder extends Quote {
  orderTitle?: string;
}

export default function QuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const ordersRes = await ordersApi.getMyOrders();
        const orders = ordersRes.data;

        const allQuotes: QuoteWithOrder[] = [];
        for (const order of orders) {
          try {
            const quotesRes = await quotesApi.getQuotesByOrder(order.id);
            const enriched = quotesRes.data.map((q) => ({
              ...q,
              orderTitle: order.title,
            }));
            allQuotes.push(...enriched);
          } catch {
            // teklifi olmayan siparişleri atla
          }
        }
        setQuotes(allQuotes);
      } catch (err: any) {
        setError('Teklifler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 border-b border-[#e9d6d1] pb-6">
        <h1 className="text-[#231916] font-bold text-3xl">Teklifler</h1>
        <p className="text-[#56423d] text-sm mt-1">
          {user?.role === 'ARTISAN'
            ? 'Müşterilere gönderdiğiniz teklifleri takip edin.'
            : 'Siparişlerinize gelen zanaatkâr tekliflerini inceleyin.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      ) : quotes.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz teklif yok</h3>
          <p className="text-[#56423d] text-sm">
            {user?.role === 'ARTISAN'
              ? 'Bekleyen siparişlere göz atın ve ilk teklifinizi gönderin.'
              : 'Siparişinize gelen zanaatkâr teklifleri burada görünecek.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-w-3xl">
          {quotes.map((q) => (
            <div key={q.id}>
              {q.orderTitle && (
                <p className="text-xs text-[#8a726b] font-medium mb-2 uppercase tracking-wide">
                  Sipariş: {q.orderTitle}
                </p>
              )}
              <QuoteCard quote={q} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
