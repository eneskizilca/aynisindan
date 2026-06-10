'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi, quotesApi, reviewsApi, paymentsApi, returnsApi, Order, Quote, Payment, Review, Return } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import QuoteCard from '@/components/QuoteCard';
import PaymentModal from '@/components/PaymentModal';
import ReturnModal from '@/components/ReturnModal';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckCircleIcon,
  XMarkIcon,
  BanknotesIcon,
  StarIcon as StarOutline,
  ArrowPathIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [showTransferAnimation, setShowTransferAnimation] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [existingReturn, setExistingReturn] = useState<Return | null>(null);

  const fetchData = async () => {
    try {
      const [orderRes, quotesRes, paymentsRes] = await Promise.all([
        ordersApi.getOrderById(id),
        quotesApi.getQuotesByOrder(id),
        paymentsApi.getPaymentsByOrder(id),
      ]);
      setOrder(orderRes.data);
      setQuotes(quotesRes.data);
      setPayments(paymentsRes.data);

      try {
        const reviewRes = await reviewsApi.getReviewByOrder(id);
        setExistingReview(reviewRes.data);
      } catch {
        setExistingReview(null);
      }

      try {
        const returnRes = await returnsApi.getReturnByOrder(id);
        setExistingReturn(returnRes.data);
      } catch {
        setExistingReturn(null);
      }
    } catch (err: any) {
      setError('Sipariş detayları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setShowTransferAnimation(false);
    setShowPaymentModal(false);
    setPaymentDone(false);
    setExistingReview(null);
    setExistingReturn(null);
    setShowReturnModal(false);
    setIsReturning(false);
    setIsLoading(true);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAcceptQuote = async (quoteId: string) => {
    setIsAccepting(quoteId);
    try {
      await quotesApi.acceptQuote(quoteId);
      await fetchData();
      setShowPaymentModal(true);
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
      setShowTransferAnimation(true);
      setTimeout(() => setShowTransferAnimation(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teslim onaylanamadı.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsCompleting(true);
    try {
      await ordersApi.completeOrder(id);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teslimat yapılamadı.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmittingReview(true);
    try {
      const res = await reviewsApi.createReview(id, { rating, comment });
      setExistingReview(res.data);
      setRating(0);
      setComment('');
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Değerlendirme gönderilemedi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCreateReturn = async (reason: string) => {
    setIsReturning(true);
    try {
      await returnsApi.createReturn(id, reason);
      setShowReturnModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'İade talebi oluşturulamadı.');
    } finally {
      setIsReturning(false);
    }
  };

  const handleHoldPayment = async () => {
    setIsPaying(true);
    setError('');
    try {
      await paymentsApi.holdFunds(id);
      setPaymentDone(true);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ödeme yapılamadı.');
    } finally {
      setIsPaying(false);
    }
  };

  const isPaymentHeld = payments.some(
    (p) => p.status === 'HELD_IN_ESCROW' || p.status === 'RELEASED_TO_ARTISAN'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  const getChatTarget = () => {
    if (isCustomer) {
      const acceptedQuote = quotes.find((q) => q.status === 'ACCEPTED');
      if (acceptedQuote) {
        return {
          id: acceptedQuote.artisanId,
          name: order.artisanName || acceptedQuote.artisanName,
        };
      }
    } else if (isArtisan) {
      return {
        id: order.customerId,
        name: order.customerName || 'Müşteri',
      };
    }
    return null;
  };

  const chatTarget = getChatTarget();

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <Link href="/orders" className="flex items-center gap-1.5 text-[#56423d] text-sm hover:text-[#de6b48] transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Siparişlere Dön
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            {existingReturn?.status === 'REFUNDED' ? (
              <span className="text-xs font-semibold text-red-800 uppercase tracking-widest bg-red-200 px-2 py-1 rounded">
                İADE EDİLDİ
              </span>
            ) : existingReturn?.status === 'REJECTED' ? (
              <span className="text-xs font-semibold text-red-700 uppercase tracking-widest bg-red-100 px-2 py-1 rounded">
                İADE REDDEDİLDİ
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#56423d] uppercase tracking-widest bg-[#f2ded9] px-2 py-1 rounded">
                {DURUM_ETIKETLERI[order.status] || order.status}
              </span>
            )}
            <span className="text-xs text-[#8a726b]">Sipariş #{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">{order.title}</h1>
          <p className="text-[#56423d] text-sm mt-2 leading-relaxed">{order.description}</p>
        </div>

        {(order.status === 'IN_PROGRESS' || order.status === 'DELIVERED') && (
          <div className="bg-[#fff1ed] border border-[#ddc0b9] rounded-xl p-4 w-full sm:max-w-xs">
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

      {/* ─── Güvenli Ticaret Sonlandı Banner ─── */}
      {order.status === 'COMPLETED' && (
        <div className="card p-8 text-center border-2 border-green-300 bg-green-50 mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Güvenli Ticaret Başarıyla Sonlandı!
          </h2>
          <p className="text-green-600 text-lg">
            ₺{order.agreedPrice?.toLocaleString('tr-TR')} zanaatkâra aktarıldı.
          </p>
        </div>
      )}

      {/* ─── Mevcut Değerlendirme (Her iki taraf için) ─── */}
      {existingReview && (
        <div className="card p-6 border-2 border-green-200 bg-green-50/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[#231916] text-lg">Değerlendirme</h3>
              <p className="text-[#56423d] text-xs">
                {new Date(existingReview.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSolid
                key={star}
                className={`w-6 h-6 ${star <= existingReview.rating ? 'text-amber-400' : 'text-[#ddc0b9]'}`}
              />
            ))}
            <span className="ml-2 font-bold text-[#231916]">{existingReview.rating}/5</span>
          </div>

          {existingReview.comment && (
            <p className="text-[#56423d] text-sm italic leading-relaxed bg-white rounded-lg p-4">
              &ldquo;{existingReview.comment}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: Görsel (sticky) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {order.referenceImageUrl ? (
            <img
              src={order.referenceImageUrl}
              alt={order.title}
              className="w-full aspect-square object-cover rounded-xl shadow-sm"
            />
          ) : (
            <div className="w-full aspect-square bg-[#feeae5] rounded-xl flex items-center justify-center text-[#8a726b] text-sm shadow-sm">
              Referans görsel yok
            </div>
          )}
        </div>

        {/* Sağ: Card'lar */}
        <div className="space-y-5">
          {/* ─── Mesajlaşma Kartı ─── */}
          {chatTarget && (
            <div className="card p-5 border border-[#e9d6d1] bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff1ed] flex items-center justify-center text-[#de6b48]">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#231916]">Sohbet ve İletişim</h3>
                  <p className="text-[#8a726b] text-xs mt-0.5">
                    {isCustomer ? `Zanaatkâr: ${chatTarget.name}` : `Müşteri: ${chatTarget.name}`}
                  </p>
                </div>
              </div>
              <Link
                href={`/messages?userId=${chatTarget.id}&userName=${encodeURIComponent(chatTarget.name)}&orderId=${order.id}`}
                className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-sm"
              >
                Mesaj Gönder
              </Link>
            </div>
          )}

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

          {isArtisan && order.status === 'PENDING' && (
            <ArtisanQuoteForm orderId={order.id} onSuccess={fetchData} />
          )}

          {/* ─── Ödeme Çağrısı (Müşteri, IN_PROGRESS, ödeme yapılmamış) ─── */}
          {isCustomer && order.status === 'IN_PROGRESS' && !isPaymentHeld && !paymentDone && (
            <div className="card p-6 border-2 border-[#de6b48]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#feeae5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <BanknotesIcon className="w-6 h-6 text-[#de6b48]" />
                </div>
                <div>
                  <h2 className="text-[#231916] font-bold text-xl">Param-Güvende Ödemesi</h2>
                  <p className="text-[#56423d] text-sm">Zanaatkâr üretim için hazır. Ödemeyi onaylayın.</p>
                </div>
              </div>

              <div className="bg-[#fff8f6] rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#56423d]">Sipariş</span>
                  <span className="font-medium text-[#231916]">{order.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#56423d]">Zanaatkâr</span>
                  <span className="font-medium text-[#231916]">{order.artisanName}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#e9d6d1] pt-2">
                  <span className="text-[#56423d] font-semibold">Anlaşılan Tutar</span>
                  <span className="font-bold text-[#de6b48] text-lg">
                    ₺{order.agreedPrice?.toLocaleString('tr-TR') ?? '—'}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-start gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-xs leading-relaxed">
                  Ödemeniz Param-Güvende sisteminde güvende tutulur. Zanaatkâr, siz teslimi onaylayana kadar paraya erişemez.
                </p>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Param-Güvende&apos;ye Yatır — ₺{order.agreedPrice?.toLocaleString('tr-TR')}
              </button>
            </div>
          )}

          {/* ─── Ödeme Başarılı (Müşteri, IN_PROGRESS, ödeme yapılmış) ─── */}
          {isCustomer && order.status === 'IN_PROGRESS' && isPaymentHeld && (
            <div className="card p-6 text-center border-2 border-green-200">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-[#231916] text-lg">Ödeme Param-Güvende&apos;de!</h3>
              <p className="text-[#56423d] text-sm mt-1">
                ₺{order.agreedPrice?.toLocaleString('tr-TR')} güvende tutuluyor. Zanaatkâr üretimine başladı.
              </p>
            </div>
          )}

          {/* ─── Kargoya Ver (Zanaatkâr, IN_PROGRESS, ödeme yapılmış) ─── */}
          {isArtisan && order.status === 'IN_PROGRESS' && isPaymentHeld && (
            <div className="card p-6 border-2 border-[#de6b48]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#feeae5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-6 h-6 text-[#de6b48]" />
                </div>
                <div>
                  <h2 className="text-[#231916] font-bold text-xl">Siparişi Teslim Et</h2>
                  <p className="text-[#56423d] text-sm">Ürünü müşteriye gönderdiğinizi onaylayın.</p>
                </div>
              </div>

              <button
                onClick={handleCompleteOrder}
                disabled={isCompleting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    İşleniyor…
                  </>
                ) : (
                  <>
                    <TruckIcon className="w-5 h-5" />
                    Kargoya Verdim
                  </>
                )}
              </button>
            </div>
          )}

          {/* ─── Teslimat Onayı (Müşteri, DELIVERED) ─── */}
          {isCustomer && order.status === 'DELIVERED' && !existingReturn && (
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
                <div className="flex gap-3 max-w-md mx-auto">
                  <button
                    id="approve-delivery"
                    onClick={handleApproveDelivery}
                    disabled={isApproving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {isApproving ? 'Onaylanıyor…' : 'Teslim Aldım'}
                  </button>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    İade Başlat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── İade Talebi Bekliyor (Müşteri, DELIVERED, iade talebi var) ─── */}
          {isCustomer && order.status === 'DELIVERED' && existingReturn?.status === 'REQUESTED' && (
            <div className="card p-6 border-2 border-amber-300 bg-amber-50">
              <div className="flex items-center gap-3 mb-3">
                <ClockIcon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 text-lg">İade Talebiniz Gönderildi</h3>
                  <p className="text-amber-700 text-sm">Zanaatkârın onayını bekliyor.</p>
                </div>
              </div>
              <p className="text-amber-800 text-sm italic bg-white/60 rounded-lg p-3">
                &ldquo;{existingReturn.reason}&rdquo;
              </p>
            </div>
          )}

          {/* ─── İade Tamamlandı (Müşteri, DELIVERED, iade onaylandı) ─── */}
          {isCustomer && order.status === 'DELIVERED' && existingReturn?.status === 'REFUNDED' && (
            <div className="card p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-700 text-lg">İade Tamamlandı</h3>
                  <p className="text-green-600">
                    ₺{order.agreedPrice?.toLocaleString('tr-TR')} hesabınıza iade edildi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── İade Reddedildi (Müşteri, DELIVERED, iade reddedildi) ─── */}
          {isCustomer && order.status === 'DELIVERED' && existingReturn?.status === 'REJECTED' && (
            <div className="card p-6 border-2 border-red-300 bg-red-50">
              <div className="flex items-center gap-3 mb-3">
                <XMarkIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-700 text-lg">İade Talebiniz Reddedildi</h3>
                  <p className="text-red-600 text-sm">Zanaatkâr iade talebini onaylamadı.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Değerlendirme Formu (Müşteri, COMPLETED, henüz değerlendirme yok) ─── */}
          {isCustomer && order.status === 'COMPLETED' && !existingReview && (
            <div className="card p-6">
              <h2 className="text-[#231916] font-bold text-xl text-center mb-5">
                El İşçiliğini Değerlendirin
              </h2>

              <form onSubmit={handleSubmitReview} className="space-y-5">
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

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* ─── Sipariş Detayları ─── */}
          <div className="card p-6 w-full">
            <h3 className="font-semibold text-[#231916] mb-4 text-lg border-b border-[#e9d6d1] pb-3">Sipariş Detayları</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="block text-[#8a726b] mb-1">Durum</span>
                {existingReturn?.status === 'REFUNDED' ? (
                  <span className="font-semibold text-red-700 px-2 py-1 bg-red-100 rounded inline-block">
                    İADE EDİLDİ
                  </span>
                ) : existingReturn?.status === 'REJECTED' ? (
                  <span className="font-semibold text-red-700 px-2 py-1 bg-red-100 rounded inline-block">
                    İADE REDDEDİLDİ
                  </span>
                ) : (
                  <span className="font-semibold text-[#231916] px-2 py-1 bg-[#f2ded9] rounded inline-block">
                    {DURUM_ETIKETLERI[order.status] || order.status}
                  </span>
                )}
              </div>
              {order.agreedPrice != null && (
                <div>
                  <span className="block text-[#8a726b] mb-1">Anlaşılan Fiyat</span>
                  <span className="font-semibold text-[#de6b48]">
                    ₺{order.agreedPrice.toLocaleString('tr-TR')}
                  </span>
                </div>
              )}
              {order.artisanName && (
                <div>
                  <span className="block text-[#8a726b] mb-1">Zanaatkâr</span>
                  <span className="font-medium text-[#231916]">{order.artisanName}</span>
                </div>
              )}
              <div>
                <span className="block text-[#8a726b] mb-1">Oluşturulma</span>
                <span className="font-medium text-[#231916]">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── İade Modalı ─── */}
      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleCreateReturn}
        orderTitle={order.title}
        amount={order.agreedPrice || 0}
      />

      {/* ─── Yeni Ödeme Modalı ─── */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleHoldPayment}
        orderTitle={order.title}
        artisanName={order.artisanName || ''}
        amount={order.agreedPrice || 0}
      />

      {/* ─── Para Aktarım Animasyonu ─── */}
      {showTransferAnimation && order.agreedPrice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="animate-bounce mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2 animate-pulse">
              ₺{order.agreedPrice.toLocaleString('tr-TR')}
            </div>
            <p className="text-green-700 font-semibold text-lg mb-1">
              Zanaatkâra Aktarıldı!
            </p>
            <p className="text-[#56423d] text-sm mb-4">
              Güvenli ticaret başarıyla sonlandı.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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
