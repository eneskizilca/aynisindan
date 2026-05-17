'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/services/api';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewOrderPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await ordersApi.createOrder({
        title,
        description,
        referenceImageUrl: referenceImageUrl || undefined,
      });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sipariş oluşturulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      {/* Geri */}
      <Link href="/dashboard/orders" className="flex items-center gap-2 text-[#56423d] text-sm hover:text-[#de6b48] mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Siparişlere Dön
      </Link>

      <h1 className="text-[#231916] font-bold text-3xl mb-1">Yeni Sipariş Oluştur</h1>
      <p className="text-[#56423d] text-sm mb-8">
        Özel eserinizi tanımlayın, zanaatkârlar en iyi tekliflerini göndersin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Sipariş Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            id="order-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="örn. Özel Ceviz Yemek Masası"
            required
            className="input-field"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Detaylı Açıklama <span className="text-red-500">*</span>
          </label>
          <textarea
            id="order-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ölçüler, malzemeler, yüzey işlemi ve özel isteklerinizi açıklayın…"
            required
            rows={5}
            className="input-field resize-none"
          />
        </div>

        {/* Referans Görsel URL */}
        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Referans Görsel URL&apos;si (İsteğe Bağlı)
          </label>
          <div className="relative">
            <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726b]" />
            <input
              id="order-image-url"
              type="url"
              value={referenceImageUrl}
              onChange={(e) => setReferenceImageUrl(e.target.value)}
              placeholder="https://ornek.com/referans-gorseli.jpg"
              className="input-field pl-10"
            />
          </div>
          <p className="text-[#8a726b] text-xs mt-1">
            Zanaatkârların vizyonunuzu anlamasına yardımcı olacak bir referans görseli ekleyin.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/orders" className="btn-secondary flex-1 text-center">
            İptal
          </Link>
          <button
            id="submit-new-order"
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Gönderiliyor…' : 'Sipariş Talebini Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}
