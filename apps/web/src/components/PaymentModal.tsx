'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheckIcon, XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderTitle: string;
  artisanName: string;
  amount: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  orderTitle,
  artisanName,
  amount,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'saved' | 'new'>('saved');
  const [isPaying, setIsPaying] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const handlePay = async () => {
    setIsPaying(true);
    try {
      await onConfirm();
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        onClose();
      }, 2500);
    } catch {
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod('saved');
      setShowAnimation(false);
      setCardNumber('');
      setCardHolder('');
      setExpiry('');
      setCvv('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isPaying ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#de6b48] to-[#c95535] px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isPaying}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <LockClosedIcon className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">Param-Güvende Ödeme</h2>
              <p className="text-white/80 text-xs">256-bit SSL ile şifrelenmiş güvenli ödeme</p>
            </div>
          </div>
        </div>

        {showAnimation ? (
          <div className="p-8 text-center">
            <div className="animate-bounce mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheckIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2 animate-pulse">
              ₺{amount.toLocaleString('tr-TR')}
            </div>
            <p className="text-green-700 font-semibold text-lg mb-1">
              Param-Güvende&apos;ye Yatırıldı!
            </p>
            <p className="text-[#56423d] text-sm">
              Ödemeniz güvence altına alındı. Zanaatkâr üretimine başlayabilir.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 mb-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
                <span className="text-sm font-semibold tracking-wider">VISA</span>
              </div>
              <div className="text-xl font-mono tracking-widest mb-4">
                {paymentMethod === 'saved' ? '4532 •••• •••• 4242' : (cardNumber || '•••• •••• •••• ••••')}
              </div>
              <div className="flex justify-between text-xs text-gray-300">
                <span>{paymentMethod === 'saved' ? 'TEST MUSTERI' : (cardHolder || 'KART SAHİBİ').toUpperCase()}</span>
                <span>{paymentMethod === 'saved' ? '12/28' : (expiry || 'AA/YY')}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#de6b48] bg-[#fff8f6] cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'saved'}
                  onChange={() => setPaymentMethod('saved')}
                  className="w-4 h-4 text-[#de6b48] focus:ring-[#de6b48]"
                />
                <div>
                  <span className="font-semibold text-[#231916] text-sm">Kayıtlı Kartım</span>
                  <span className="text-[#56423d] text-xs ml-2">(**** 4242)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#e9d6d1] hover:border-[#de6b48] cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'new'}
                  onChange={() => setPaymentMethod('new')}
                  className="w-4 h-4 text-[#de6b48] focus:ring-[#de6b48]"
                />
                <span className="font-semibold text-[#231916] text-sm">Yeni Kart Kullan</span>
              </label>
            </div>

            {paymentMethod === 'new' && (
              <div className="space-y-4 mb-6 p-4 bg-[#fff8f6] rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-[#56423d] mb-1">Kart Numarası</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4532 1234 5678 4242"
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#56423d] mb-1">Kart Sahibi</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Ad Soyad"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#56423d] mb-1">Son Kullanma</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="12/28"
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#56423d] mb-1">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      className="input-field font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#fff8f6] rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#56423d]">Sipariş</span>
                <span className="font-medium text-[#231916] truncate ml-4">{orderTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#56423d]">Zanaatkâr</span>
                <span className="font-medium text-[#231916]">{artisanName}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#e9d6d1] pt-2">
                <span className="text-[#56423d] font-semibold">Ödenecek Tutar</span>
                <span className="font-bold text-[#de6b48] text-xl">
                  ₺{amount.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-6 text-xs text-[#56423d]">
              <LockClosedIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Bilgileriniz sunucularımızda saklanmaz.</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isPaying}
              >
                İptal
              </button>
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isPaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    İşleniyor…
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-4 h-4" />
                    Ödemeyi Tamamle
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
