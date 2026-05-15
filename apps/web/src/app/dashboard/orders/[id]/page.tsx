'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi, quotesApi, reviewsApi, Order, Quote } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import QuoteCard from '@/components/QuoteCard';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const DURUM_ETIKETLERI: Record<string, string> = {
  PENDING: 'TEKLİF BEKLENİYOR',
  IN_PROGRESS: 'DEVAM EDİYOR',
  DELIVERED: 'TESLİM EDİLDİ',
  COMPLETED: 'TAMAMLANDI',
  CANCELLED: 'İPTAL EDİLDİ',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Değerlendirme durumu
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewDone, setReviewDone] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [orderRes, quotesRes] = await Promise.all([
        ordersApi.getOrderById(id),
        quotesApi.getQuotesByOrder(id),
      ]);
      setOrder(orderRes.data);
      setQuotes(quotesRes.data);
    } catch (err: any) {
      setError('Sipariş detayları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAcceptQuote = async (quoteId: string) => {
    setIsAccepting(quoteId);
    try {
      await quotesApi.acceptQuote(quoteId);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teklif kabul edilemedi.');
    } finally {
      setIsAccepting(null);
    }
  };

  const handleApproveDelivery = async () => {
    setIsApproving(true);
    try {
      await ordersApi.approveOrder(id);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teslim onaylanamadı.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmittingReview(true);
    try {
      await reviewsApi.createReview(id, { rating, comment });
      setReviewDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Değerlendirme gönderilemedi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <p className="text-red-600">Sipariş bulunamadı.</p>
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isArtisan = user?.role === 'ARTISAN';

  return (
    <div className="p-8 max-w-5xl">
      {/* Geri + Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-[#56423d] text-sm hover:text-[#de6b48] transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Siparişlere Dön
        </Link>
      </div>

      <div className="flex items-start gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-[#56423d] uppercase tracking-widest bg-[#f2ded9] px-2 py-1 rounded">
              {DURUM_ETIKETLERI[order.status] || order.status}
            </span>
            <span className="text-xs text-[#8a726b]">Sipariş #{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-[#231916] font-bold text-3xl">{order.title}</h1>
          <p className="text-[#56423d] text-sm mt-2 leading-relaxed max-w-xl">{order.description}</p>
        </div>

        {/* Param-Güvende bildirimi */}
        {(order.status === 'IN_PROGRESS' || order.status === 'DELIVERED') && (
          <div className="bg-[#fff1ed] border border-[#ddc0b9] rounded-xl p-4 max-w-xs">
            <div className="flex items-start gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-[#de6b48] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#231916] text-sm font-semibold">Param-Güvende Aktif.</p>
                <p className="text-[#56423d] text-xs mt-0.5">
                  Ödemeniz, teslimi onaylayana kadar Param-Güvende sisteminde korunmaktadır.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ana düzen */}
      <div className="flex gap-6">
        {/* Sol: Referans görsel + detaylar */}
        <div className="w-72 shrink-0">
          {order.referenceImageUrl ? (
            <img
              src={order.referenceImageUrl}
              alt={order.title}
              className="w-full h-52 object-cover rounded-xl mb-4"
            />
          ) : (
            <div className="w-full h-52 bg-[#feeae5] rounded-xl flex items-center justify-center mb-4 text-[#8a726b] text-sm">
              Referans görsel yok
            </div>
          )}
          <div className="card p-4">
            <h3 className="font-semibold text-[#231916] mb-3">Sipariş Detayları</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#56423d]">Durum</span>
                <span className="font-medium text-[#231916]">{DURUM_ETIKETLERI[order.status]}</span>
              </div>
              {order.artisanName && (
                <div className="flex justify-between">
                  <span className="text-[#56423d]">Zanaatkâr</span>
                  <span className="font-medium text-[#231916]">{order.artisanName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#56423d]">Oluşturulma</span>
                <span className="font-medium text-[#231916]">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Teklifler / Teslimat / Değerlendirme */}
        <div className="flex-1 space-y-5">
          {/* Teklifler (müşteri, PENDING sipariş) */}
          {isCustomer && order.status === 'PENDING' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-[#231916] font-bold text-xl">
                  {quotes.length} Teklif Alındı
                </h2>
                {quotes.length > 0 && (
                  <span className="text-sm text-[#56423d]">
                    Sırala: <span className="text-[#de6b48] font-semibold cursor-pointer">Önerilen</span>
                  </span>
                )}
              </div>
              {quotes.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-[#56423d]">Henüz teklif yok. Zanaatkârlar kısa süre içinde tekliflerini gönderecek.</p>
                </div>
              ) : (
                quotes.map((q, idx) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    onAccept={handleAcceptQuote}
                    isAccepting={isAccepting === q.id}
                    isBestMatch={idx === 0}
                  />
                ))
              )}
            </>
          )}

          {/* Zanaatkâr teklif formu */}
          {isArtisan && order.status === 'PENDING' && (
            <ArtisanQuoteForm orderId={order.id} onSuccess={fetchData} />
          )}

          {/* Teslimat onayı (müşteri, DELIVERED sipariş) */}
          {isCustomer && order.status === 'DELIVERED' && (
            <div className="card">
              <div className="p-6 border-b border-[#e9d6d1] flex items-center gap-4">
                {order.referenceImageUrl && (
                  <img
                    src={order.referenceImageUrl}
                    alt={order.title}
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div>
                  <span className="status-badge bg-[#feeae5] text-[#de6b48] text-xs mb-1 inline-block">
                    🚚 Hedefe Ulaştı
                  </span>
                  <h3 className="font-bold text-[#231916] text-lg">{order.title}</h3>
                  {order.artisanName && (
                    <p className="text-[#56423d] text-sm">Yapan: {order.artisanName}</p>
                  )}
                </div>
              </div>

              <div className="p-6 text-center border-b border-[#e9d6d1]">
                <p className="text-[#56423d] text-sm leading-relaxed mb-5">
                  Teslimi onaylayarak Param-Güvende sistemindeki ödemeyi zanaatkâra serbest bırakırsınız.
                </p>
                <button
                  id="approve-delivery"
                  onClick={handleApproveDelivery}
                  disabled={isApproving}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {isApproving ? 'Onaylanıyor…' : 'Siparişimi Teslim Aldım'}
                </button>
              </div>
            </div>
          )}

          {/* Değerlendirme (müşteri, COMPLETED sipariş) */}
          {isCustomer && order.status === 'COMPLETED' && !reviewDone && (
            <div className="card p-6">
              <h2 className="text-[#231916] font-bold text-xl text-center mb-5">
                El İşçiliğini Değerlendirin
              </h2>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Yıldızlar */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      id={`star-${star}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <StarSolid
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400'
                            : 'text-[#ddc0b9]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#231916] mb-1.5">
                    Düşüncelerinizi paylaşın (İsteğe Bağlı)
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="El işçiliği mükemmeldi…"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <button
                  id="submit-review"
                  type="submit"
                  disabled={isSubmittingReview || rating === 0}
                  className="btn-primary w-full"
                >
                  {isSubmittingReview ? 'Gönderiliyor…' : 'Değerlendirmeyi Gönder'}
                </button>
              </form>
            </div>
          )}

          {reviewDone && (
            <div className="card p-6 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-[#231916]">Değerlendirmeniz için teşekkürler!</h3>
              <p className="text-[#56423d] text-sm mt-1">
                Geri bildiriminiz zanaatkârların büyümesine yardımcı olur.
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Zanaatkâr Teklif Formu ───────────────────────────────────────────────────
function ArtisanQuoteForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await quotesApi.createQuote({
        orderId,
        offeredPrice: parseFloat(price),
        estimatedDays: parseInt(days),
        message: message || undefined,
      });
      setDone(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teklif gönderilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card p-6 text-center">
        <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-[#231916]">Teklif başarıyla gönderildi!</h3>
        <p className="text-[#56423d] text-sm mt-1">Müşteri teklifinizi inceleyecek.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-[#231916] font-bold text-xl mb-5">Teklifinizi Gönderin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Teklif Fiyatı (₺) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quote-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="18500"
              required
              min={1}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Teslimat Günü <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quote-days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="21"
              required
              min={1}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Mesaj (İsteğe Bağlı)
          </label>
          <textarea
            id="quote-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Yaklaşımınızı ve kullanacağınız malzemeleri açıklayın…"
            rows={3}
            className="input-field resize-none"
          />
        </div>
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button
          id="submit-quote"
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Gönderiliyor…' : 'Teklifi Gönder'}
        </button>
      </form>
    </div>
  );
}
