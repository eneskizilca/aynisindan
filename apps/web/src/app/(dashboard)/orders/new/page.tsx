'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/services/api';
import { ArrowLeftIcon, PhotoIcon, CloudArrowUpIcon, LinkIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

const CATEGORIES = [
  { value: '', label: 'Kategori secin...' },
  { value: 'Marangozluk', label: 'Marangozluk (Ahsap)' },
  { value: 'Metal Isciligi', label: 'Metal Isciligi' },
  { value: 'Seramik', label: 'Seramik / Cam' },
  { value: 'Tekstil', label: 'Tekstil / Dericilik' },
  { value: 'Takı', label: 'Taki / Muzerret' },
  { value: 'Diger', label: 'Diger' },
];

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

  const [category, setCategory] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');

  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState('');
  const [aiSketchUrl, setAiSketchUrl] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementStep, setEnhancementStep] = useState<'idle' | 'enhancing' | 'review' | 'done'>('idle');

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

  const handleEnhanceSketch = async () => {
    if (!croppedFile) return;
    setError('');
    setIsEnhancing(true);
    setEnhancementStep('enhancing');

    try {
      const res = await ordersApi.enhanceSketch(
        croppedFile,
        category || 'Diger',
        dimensions || 'Belirtilmemis',
        material || 'Belirtilmemis'
      );
      setAiSketchUrl(res.data.sketchUrl);
      setAiGeneratedImageUrl(res.data.aiGeneratedUrl);
      setEnhancementStep('review');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Eskiz iyilestirilemedi.';
      setError(msg);
      setEnhancementStep('idle');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptAiImage = () => {
    setEnhancementStep('done');
  };

  const handleRejectAiImage = () => {
    setAiGeneratedImageUrl('');
    setAiSketchUrl('');
    setEnhancementStep('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let finalImageUrl = uploadMode === 'url' ? referenceImageUrl : undefined;

      if (uploadMode === 'local' && croppedFile && !aiGeneratedImageUrl) {
        const uploadRes = await ordersApi.uploadSketch(croppedFile);
        finalImageUrl = uploadRes.data.url;
      }

      if (aiSketchUrl && !finalImageUrl) {
        finalImageUrl = aiSketchUrl;
      }

      await ordersApi.createOrder({
        title,
        description,
        referenceImageUrl: finalImageUrl || undefined,
        aiGeneratedImageUrl: aiGeneratedImageUrl || undefined,
      });
      router.push('/orders');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Siparis olusturulamadi.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || (!!imgSrc && !previewUrl);

  return (
    <div className="p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <Link href="/orders" className="flex items-center gap-2 text-[#56423d] text-sm hover:text-[#de6b48] mb-4 sm:mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Siparislere Don
      </Link>

      <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl mb-1">Yeni Siparis Olustur</h1>
      <p className="text-[#56423d] text-sm mb-6 sm:mb-8">
        Ozel eserinizi tanimlayin, zanaatkarlar en iyi tekliflerini gonderin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Siparis Basligi <span className="text-red-500">*</span>
          </label>
          <input
            id="order-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="orn. Ozel Ceviz Yemek Masasi"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#231916] mb-1.5">
            Detayli Aciklama <span className="text-red-500">*</span>
          </label>
          <textarea
            id="order-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Olculer, malzemeler, yuzey islemi ve ozel isteklerinizi aciklayin..."
            required
            rows={5}
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Olculer
            </label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="orn. 120x80x75 cm"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#231916] mb-1.5">
              Malzeme
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="orn. Ceviz agaci"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-semibold text-[#231916]">
              Referans Gorsel (Istege Bagli)
            </label>
            <div className="flex bg-[#f2ded9] rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMode('local')}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${uploadMode === 'local' ? 'bg-white shadow text-[#231916] font-semibold' : 'text-[#8a726b] hover:text-[#231916]'
                  }`}
              >
                <CloudArrowUpIcon className="w-4 h-4" /> Yukle
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
              {!imgSrc && !previewUrl && enhancementStep === 'idle' && (
                <>
                  <CloudArrowUpIcon className="w-10 h-10 text-[#de6b48] mx-auto mb-2" />
                  <p className="text-sm text-[#56423d] mb-4">Bir gorsel secin ve kare olarak kirpin</p>
                  <label className="btn-secondary cursor-pointer inline-block">
                    Bilgisayardan Sec
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
                  <p className="text-sm font-semibold text-[#231916] mb-3">Istediginiz alani kirpin:</p>
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
                      Iptal
                    </button>
                    <button type="button" onClick={generateCroppedImage} className="btn-primary">
                      Kirpmayi Onayla
                    </button>
                  </div>
                </div>
              )}

              {previewUrl && !imgSrc && enhancementStep === 'idle' && (
                <div className="flex flex-col items-center">
                  <img src={previewUrl} alt="Cropped result" className="w-48 h-48 object-cover rounded-xl shadow-sm mb-4" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setPreviewUrl(''); setCroppedFile(null); }} className="btn-secondary text-xs">
                      Gorseli Degistir
                    </button>
                    <button
                      type="button"
                      onClick={handleEnhanceSketch}
                      className="btn-primary text-xs flex items-center gap-1.5"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Eskizi Iyilestir (AI)
                    </button>
                  </div>
                </div>
              )}

              {enhancementStep === 'enhancing' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-[#ddc0b9]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#de6b48] animate-spin"></div>
                    <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-[#de6b48] animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-[#231916] mb-1">Eskiziniz isleniyor...</p>
                  <p className="text-xs text-[#8a726b]">Zanaatkarlarimiz icin referans gorsel hazirlaniyor</p>
                  <div className="mt-4 w-48 h-2 bg-[#f2ded9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#de6b48] rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}

              {enhancementStep === 'review' && aiGeneratedImageUrl && (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-[#231916] mb-3">Talebiniz buna benziyor mu?</p>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-[#8a726b] mb-2">Orijinal Eskiz</p>
                      <img src={previewUrl} alt="Original sketch" className="w-40 h-40 object-cover rounded-xl shadow-sm border-2 border-[#ddc0b9]" />
                    </div>
                    <div className="flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-[#de6b48]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#8a726b] mb-2">AI Referans Gorsel</p>
                      <img src={aiGeneratedImageUrl} alt="AI generated reference" className="w-40 h-40 object-cover rounded-xl shadow-sm border-2 border-[#de6b48]" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleRejectAiImage} className="btn-secondary text-xs flex items-center gap-1">
                      <XMarkIcon className="w-4 h-4" />
                      Vazgec
                    </button>
                    <button type="button" onClick={handleAcceptAiImage} className="btn-primary text-xs">
                      Bena benziyor, kullan
                    </button>
                  </div>
                </div>
              )}

              {enhancementStep === 'done' && aiGeneratedImageUrl && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img src={aiGeneratedImageUrl} alt="AI generated reference" className="w-48 h-48 object-cover rounded-xl shadow-sm mb-4 border-2 border-[#de6b48]" />
                    <div className="absolute -top-2 -right-2 bg-[#de6b48] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <SparklesIcon className="w-3 h-3" />
                      AI
                    </div>
                  </div>
                  <p className="text-xs text-[#56423d] mb-2">AI referans gorseli siparise eklenecek</p>
                  <button type="button" onClick={() => { setAiGeneratedImageUrl(''); setAiSketchUrl(''); setEnhancementStep('idle'); }} className="btn-secondary text-xs">
                    Gorseli Degistir
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="text-[#8a726b] text-xs mt-2">
            Zanaatkarlarin vizyonunuzu anlamasina yardimci olacak bir referans gorseli ekleyin.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/orders" className="btn-secondary flex-1 text-center">
            Iptal
          </Link>
          <button
            id="submit-new-order"
            type="submit"
            disabled={isSubmitDisabled}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Gonderiliyor...' : 'Siparis Talebini Gonder'}
          </button>
        </div>
      </form>
    </div>
  );
}
