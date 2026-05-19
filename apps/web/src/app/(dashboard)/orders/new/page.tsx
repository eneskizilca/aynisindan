'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/services/api';
import { ArrowLeftIcon, PhotoIcon, CloudArrowUpIcon, LinkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function NewOrderPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [uploadMode, setUploadMode] = useState<'url' | 'local'>('local');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'cropped-sketch.jpg', { type: 'image/jpeg' });
      setCroppedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setImgSrc('');
    }, 'image/jpeg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let finalImageUrl = uploadMode === 'url' ? referenceImageUrl : undefined;

      if (uploadMode === 'local' && croppedFile) {
        const uploadRes = await ordersApi.uploadSketch(croppedFile);
        finalImageUrl = uploadRes.data.url;
      }

      await ordersApi.createOrder({
        title,
        description,
        referenceImageUrl: finalImageUrl || undefined,
      });
      router.push('/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sipariş oluşturulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <Link href="/orders" className="flex items-center gap-2 text-[#56423d] text-sm hover:text-[#de6b48] mb-4 sm:mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Siparişlere Dön
      </Link>

      <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl mb-1">Yeni Sipariş Oluştur</h1>
      <p className="text-[#56423d] text-sm mb-6 sm:mb-8">
        Özel eserinizi tanımlayın, zanaatkârlar en iyi tekliflerini göndersin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-semibold text-[#231916]">
              Referans Görsel (İsteğe Bağlı)
            </label>
            <div className="flex bg-[#f2ded9] rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMode('local')}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${uploadMode === 'local' ? 'bg-white shadow text-[#231916] font-semibold' : 'text-[#8a726b] hover:text-[#231916]'
                  }`}
              >
                <CloudArrowUpIcon className="w-4 h-4" /> Yükle
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${uploadMode === 'url' ? 'bg-white shadow text-[#231916] font-semibold' : 'text-[#8a726b] hover:text-[#231916]'
                  }`}
              >
                <LinkIcon className="w-4 h-4" /> Link
              </button>
            </div>
          </div>

          {uploadMode === 'url' ? (
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
          ) : (
            <div className="border-2 border-dashed border-[#ddc0b9] rounded-xl p-6 text-center hover:bg-[#fff1ed] transition-colors">
              {!imgSrc && !previewUrl && (
                <>
                  <CloudArrowUpIcon className="w-10 h-10 text-[#de6b48] mx-auto mb-2" />
                  <p className="text-sm text-[#56423d] mb-4">Bir görsel seçin ve kare olarak kırpın</p>
                  <label className="btn-secondary cursor-pointer inline-block">
                    Bilgisayardan Seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                      className="hidden"
                    />
                  </label>
                </>
              )}

              {imgSrc && (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-[#231916] mb-3">İstediğiniz alanı kırpın:</p>
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop={false}
                  >
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-h-64 object-contain"
                    />
                  </ReactCrop>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setImgSrc('')} className="btn-secondary">
                      İptal
                    </button>
                    <button type="button" onClick={generateCroppedImage} className="btn-primary">
                      Kırpmayı Onayla
                    </button>
                  </div>
                </div>
              )}

              {previewUrl && !imgSrc && (
                <div className="flex flex-col items-center">
                  <img src={previewUrl} alt="Cropped result" className="w-48 h-48 object-cover rounded-xl shadow-sm mb-4" />
                  <button type="button" onClick={() => { setPreviewUrl(''); setCroppedFile(null); }} className="btn-secondary text-xs">
                    Görseli Değiştir
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="text-[#8a726b] text-xs mt-2">
            Zanaatkârların vizyonunuzu anlamasına yardımcı olacak bir referans görseli ekleyin.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/orders" className="btn-secondary flex-1 text-center">
            İptal
          </Link>
          <button
            id="submit-new-order"
            type="submit"
            disabled={isLoading || (!!imgSrc && !previewUrl)}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Gönderiliyor…' : 'Sipariş Talebini Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}
