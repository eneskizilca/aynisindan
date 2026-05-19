'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderTitle: string;
  amount: number;
}

export default function ReturnModal({
  isOpen,
  onClose,
  onConfirm,
  orderTitle,
  amount,
}: ReturnModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">İade Talebi</h2>
              <p className="text-white/80 text-xs">İade sebebini belirtin</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-[#fff8f6] rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#56423d]">Sipariş</span>
              <span className="font-medium text-[#231916] truncate ml-4">{orderTitle}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#e9d6d1] pt-2">
              <span className="text-[#56423d] font-semibold">İade Tutarı</span>
              <span className="font-bold text-amber-600 text-xl">
                ₺{amount.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              İade Sebebi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ürün beklediğim gibi değil çünkü..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gönderiliyor…
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  İade Talebini Gönder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
