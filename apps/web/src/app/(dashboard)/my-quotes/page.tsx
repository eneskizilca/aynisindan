'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { quotesApi, Quote } from '@/services/api';
import Link from 'next/link';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Kabul Edildi',
  REJECTED: 'Reddedildi',
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600',
  ACCEPTED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-600',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <ClockIcon className="w-3.5 h-3.5" />,
  ACCEPTED: <CheckCircleIcon className="w-3.5 h-3.5" />,
  REJECTED: <XCircleIcon className="w-3.5 h-3.5" />,
};

export default function MyQuotesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await quotesApi.getMyQuotes();
        setQuotes(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Teklifler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Tekliflerim</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Gönderdiğiniz tekliflerin durumunu takip edin.
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
      ) : quotes.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8 text-[#de6b48]" />
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz teklif yok</h3>
          <p className="text-[#56423d] text-sm mb-6">
            İş fırsatları sayfasından bekleyen siparişlere teklif gönderin.
          </p>
          <Link href="/feed" className="btn-primary">
            İş Fırsatlarına Git
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[quote.status] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_ICONS[quote.status]}
              {STATUS_LABELS[quote.status] || quote.status}
            </span>
          </div>
          {quote.orderTitle && (
            <h3 className="font-semibold text-[#231916] text-base leading-snug truncate">
              {quote.orderTitle}
            </h3>
          )}
          {quote.message && (
            <p className="text-[#56423d] text-sm mt-2 italic leading-relaxed line-clamp-2">
              &ldquo;{quote.message}&rdquo;
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-[#231916]">
            ₺{quote.offeredPrice.toLocaleString('tr-TR')}
          </p>
          <p className="text-xs text-[#56423d] mt-1">
            {quote.estimatedDays} Günde Teslimat
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e9d6d1]">
        <span className="text-xs text-[#8a726b]">
          {new Date(quote.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <Link
          href={`/orders/${quote.orderId}`}
          className="text-[#de6b48] text-sm font-semibold hover:underline flex items-center gap-1"
        >
          Siparişi Gör
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
