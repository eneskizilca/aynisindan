'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { portfolioApi, Portfolio } from '@/services/api';
import { StarIcon } from '@heroicons/react/24/solid';
import { ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function ArtisanPortfolioPage() {
  const { artisanId } = useParams<{ artisanId: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!artisanId) return;
    portfolioApi.getPortfolio(artisanId)
      .then((res) => setPortfolio(res.data))
      .catch(() => setPortfolio(null))
      .finally(() => setIsLoading(false));
  }, [artisanId]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[#feeae5] rounded" />
          <div className="h-4 w-72 bg-[#feeae5] rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#feeae5] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto text-center py-24">
        <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircleIcon className="w-8 h-8 text-[#8a726b]" />
        </div>
        <h3 className="text-[#231916] font-semibold text-lg mb-1">Portfolyo bulunamadı</h3>
        <p className="text-[#56423d] text-sm">Bu zanaatkâr henüz portfolyo oluşturmamış.</p>
      </div>
    );
  }

  const avgRating = portfolio.rating_count > 0
    ? (portfolio.rating_sum / portfolio.rating_count).toFixed(1)
    : '—';

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Artisan Profile */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#feeae5] flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="w-10 h-10 text-[#8a726b]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#231916] font-bold text-2xl">{portfolio.full_name}</h1>
            {portfolio.profession && (
              <p className="text-[#56423d] text-sm">{portfolio.profession}</p>
            )}
            {portfolio.bio && (
              <p className="text-[#56423d] text-sm mt-2 leading-relaxed">{portfolio.bio}</p>
            )}
            {portfolio.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {portfolio.skills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-[#feeae5] text-[#de6b48] font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-center flex-shrink-0">
            <div className="flex items-center gap-1 text-amber-500 justify-center">
              <StarIcon className="w-5 h-5" />
              <span className="font-bold text-lg text-[#231916]">{avgRating}</span>
            </div>
            <p className="text-xs text-[#56423d]">{portfolio.rating_count} değerlendirme</p>
          </div>
        </div>
      </div>

      {/* Works Grid */}
      {portfolio.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#56423d]">Henüz tamamlanmış iş bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden bg-white border border-[#e9d6d1] hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square bg-[#feeae5] overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8a726b] text-sm">
                    Görsel yok
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-[#231916] text-sm leading-tight truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-[#56423d] mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.price > 0 && (
                  <p className="text-[#de6b48] font-bold text-sm mt-1">
                    ₺{item.price.toLocaleString('tr-TR')}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-[#8a726b]">
                    <ClockIcon className="w-3 h-3" />
                    {new Date(item.completed_at).toLocaleDateString('tr-TR')}
                  </div>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <StarIcon className="w-3 h-3" />
                      {item.rating}
                    </span>
                  )}
                </div>
                {item.comment && (
                  <p className="text-xs italic text-[#56423d] mt-2 bg-[#fff8f6] rounded-lg p-2">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
