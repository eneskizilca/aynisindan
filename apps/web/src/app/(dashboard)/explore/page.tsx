'use client';

import { useEffect, useState } from 'react';
import { catalogApi, CatalogFeedItem } from '@/services/api';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function ExplorePage() {
  const [feed, setFeed] = useState<CatalogFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    catalogApi.getFeed()
      .then((res) => setFeed(res.data))
      .catch(() => setFeed([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6">
        <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Keşfet</h1>
        <p className="text-[#56423d] text-sm mt-1">
          Tamamlanan eserlere göz atın ve &ldquo;Aynısından&rdquo; isteyin.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#feeae5] aspect-square animate-pulse" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Henüz eser yok</h3>
          <p className="text-[#56423d] text-sm">
            Tamamlanan işler burada görünecek.
          </p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {feed.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.artisan_id}`}
              className="break-inside-avoid block rounded-xl overflow-hidden bg-white border border-[#e9d6d1] hover:shadow-lg transition-shadow group"
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
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#8a726b]">{item.artisan_name}</span>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <StarIcon className="w-3 h-3" />
                      {item.rating}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[#231916] text-sm leading-tight truncate">{item.title}</h3>
                {item.price > 0 && (
                  <p className="text-[#de6b48] font-bold text-sm mt-1">
                    ₺{item.price.toLocaleString('tr-TR')}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#8a726b]">
                  <ClockIcon className="w-3 h-3" />
                  {new Date(item.completed_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
