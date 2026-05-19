'use client';

import { Quote } from '@/services/api';
import { StarIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

interface QuoteCardProps {
  quote: Quote;
  onAccept?: (quoteId: string) => void;
  isAccepting?: boolean;
  isBestMatch?: boolean;
}

export default function QuoteCard({ quote, onAccept, isAccepting, isBestMatch }: QuoteCardProps) {
  return (
    <div className={`card p-5 relative ${isBestMatch ? 'border-[#de6b48]' : ''}`}>
      {isBestMatch && (
        <span className="absolute -top-3 right-4 bg-[#de6b48] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <StarIcon className="w-3 h-3" /> En İyi Eşleşme
        </span>
      )}

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Zanaatkâr bilgisi */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-full bg-[#feeae5] flex items-center justify-center text-[#de6b48] font-bold text-lg flex-shrink-0">
            {quote.artisanName?.charAt(0) ?? 'Z'}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#231916]">{quote.artisanName}</h4>
            <div className="flex items-center gap-1 text-xs text-[#56423d] mt-0.5 flex-wrap">
              {quote.artisanRating != null && (
                <>
                  <StarIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="font-medium">{quote.artisanRating.toFixed(1)}</span>
                  {quote.artisanReviewCount != null && (
                    <span>({quote.artisanReviewCount} Değerlendirme)</span>
                  )}
                  {quote.artisanCity && <span>· {quote.artisanCity}</span>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fiyat + teslimat */}
        <div className="text-right sm:text-right flex-shrink-0 self-end sm:self-auto">
          <p className="text-xl sm:text-2xl font-bold text-[#231916]">
            ₺{quote.offeredPrice.toLocaleString('tr-TR')}
          </p>
          <p className="text-xs text-[#56423d] flex items-center gap-1 justify-end mt-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {quote.estimatedDays} Günde Teslimat
          </p>
        </div>
      </div>

      {/* Mesaj */}
      {quote.message && (
        <p className="mt-4 text-sm text-[#56423d] italic leading-relaxed border-t border-[#e9d6d1] pt-4">
          &ldquo;{quote.message}&rdquo;
        </p>
      )}

      {/* Teklifi Kabul Et */}
      {onAccept && quote.status === 'PENDING' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onAccept(quote.id)}
            disabled={isAccepting}
            className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] ${
              isBestMatch
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            {isAccepting ? 'Kabul Ediliyor…' : 'Teklifi Kabul Et'}
          </button>
        </div>
      )}

      {quote.status === 'ACCEPTED' && (
        <div className="mt-4 flex justify-end">
          <span className="status-badge status-completed">✓ Kabul Edildi</span>
        </div>
      )}
    </div>
  );
}
