'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  SparklesIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, LockClosedIcon as LockClosedSolid } from '@heroicons/react/24/solid';

// Categories data structure
const CATEGORIES = [
  {
    title: 'Marangozluk & Ahşap İşleri',
    desc: 'Özel tasarım masalar, kütüphaneler, meşe komodinler ve masif ahşap aksesuarlar.',
    icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
    badge: 'AKTİF HİZMET',
    count: '70+ Aktif Zanaatkâr',
    active: true
  },
  {
    title: 'Terzi & Tekstil Tasarımı',
    desc: 'El dokuması perde, özel dikim keten takımlar ve el yapımı döşemelik kumaşlar.',
    icon: '🧶',
    badge: 'ÇOK YAKINDA',
    count: 'Geliştirme Aşamasında',
    active: false
  },
  {
    title: 'Ressam & Duvar Sanatı',
    desc: 'Evinize özel yağlı boya tablolar, karakalem portreler ve sanatsal illüstrasyonlar.',
    icon: '🎨',
    badge: 'ÇOK YAKINDA',
    count: 'Geliştirme Aşamasında',
    active: false
  },
  {
    title: 'Porselen & Seramik',
    desc: 'Özel çamur çömlekler, el yapımı kupalar, tabaklar ve benzersiz dekoratif vazolar.',
    icon: '🏺',
    badge: 'ÇOK YAKINDA',
    count: 'Geliştirme Aşamasında',
    active: false
  },
  {
    title: 'Deri İşçiliği',
    desc: 'Elde dikilmiş deri cüzdanlar, çantalar, seyahat kılıfları ve özel aksesuarlar.',
    icon: '💼',
    badge: 'ÇOK YAKINDA',
    count: 'Geliştirme Aşamasında',
    active: false
  },
  {
    title: 'Metal & Demircilik',
    desc: 'Endüstriyel metal mobilya ayakları, dövme demir şamdanlar ve bakır mutfak gereçleri.',
    icon: '⚒️',
    badge: 'ÇOK YAKINDA',
    count: 'Geliştirme Aşamasında',
    active: false
  }
];

// Artisans data structure
const ARTISANS = [
  {
    name: 'Ahmet Demirci (Ahmet Usta)',
    initials: 'AD',
    badge: 'Usta Marangoz',
    experience: '32 Yıl Deneyim',
    rating: '4.9',
    reviews: 124,
    location: 'Kadıköy, İstanbul',
    specialties: ['Masif Meşe Masa', 'Epoksi Mobilya', 'Antika Restorasyonu'],
    works: [
      { title: 'Ceviz Yemek Masası', details: 'Doğal Kenarlı, 6 Kişilik' },
      { title: 'Kitaplık', details: 'Gömme Raf Sistemi' },
      { title: 'Ahşap Konsol', details: 'Rattan Kapak Detaylı' }
    ]
  },
  {
    name: 'Murat Yıldız (Atölye Meşe)',
    initials: 'MY',
    badge: 'Tasarım Ustası',
    experience: '18 Yıl Deneyim',
    rating: '4.8',
    reviews: 86,
    location: 'İnegöl, Bursa',
    specialties: ['Giyinme Odası', 'Ahşap Oyma Sanatı', 'Televizyon Üniteleri'],
    works: [
      { title: 'Rustik Gardırop', details: 'Budaklı Masif Çam' },
      { title: 'Ahşap Kesme Tahtası', details: 'End-grain Ceviz/Akçaağaç' },
      { title: 'Minimalist Sehpa', details: 'İskandinav Tarzı Ayaklı' }
    ]
  },
  {
    name: 'Elif & Cem (Studio Woodwork)',
    initials: 'EC',
    badge: 'Modern Tasarımcı',
    experience: '8 Yıl Deneyim',
    rating: '5.0',
    reviews: 42,
    location: 'Bodrum, Muğla',
    specialties: ['Mid-Century Modern', 'Özel Tasarım Sandalyeler', 'Banyo Tezgahı'],
    works: [
      { title: 'Kollu Sandalye', details: 'Walnut & Keten Döşeme' },
      { title: 'Banyo Rafı', details: 'Suya Dayanıklı Tik Ağacı' },
      { title: 'Ahşap Saksılık', details: 'Geometrik Katmanlı' }
    ]
  }
];

export default function LandingPage() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Before/after comparison move logic
  const handleMove = (clientX: number, containerRect: DOMRect) => {
    const x = clientX - containerRect.left;
    const percentage = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    handleMove(touch.clientX, rect);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      handleMove(e.clientX, rect);
    }
  };

  const startTouchDrag = (e: React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      handleMove(e.touches[0].clientX, rect);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-[#fff8f6] font-sans selection:bg-[#de6b48]/20 selection:text-[#de6b48]">
      
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#fff8f6]/85 backdrop-blur-md border-b border-[#e9d6d1]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-[#de6b48]/10 rounded-xl flex items-center justify-center border border-[#de6b48]/25 shadow-inner">
                <Image src="/logo.svg" alt="Aynısından Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-[#de6b48] font-bold text-lg leading-tight tracking-tight">Aynısından</h1>
                <p className="text-[#56423d] text-[10px] uppercase font-semibold tracking-wider -mt-0.5">isteyenlerin pazarı!</p>
              </div>
            </div>
            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#56423d]">
              <a href="#pinterest-to-product" className="hover:text-[#de6b48] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#de6b48] hover:after:w-full after:transition-all after:duration-300">Örnek Üretim</a>
              <a href="#nasil-calisir" className="hover:text-[#de6b48] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#de6b48] hover:after:w-full after:transition-all after:duration-300">Nasıl Çalışır?</a>
              <a href="#kategoriler" className="hover:text-[#de6b48] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#de6b48] hover:after:w-full after:transition-all after:duration-300">Kategoriler</a>
              <a href="#zanaatkarlar" className="hover:text-[#de6b48] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#de6b48] hover:after:w-full after:transition-all after:duration-300">Ustalarımız</a>
              <a href="#guvenlik" className="hover:text-[#de6b48] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#de6b48] hover:after:w-full after:transition-all after:duration-300">Param-Güvende</a>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-[#56423d] hover:text-[#de6b48] transition-colors px-3 py-2">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn-primary text-sm px-6 py-3 shadow-md hover:shadow-lg transition-all rounded-xl">
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-24">
        {/* Background Workshop Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/wood_workshop_ambient.png" 
            alt="Warm Wood Carpenter Workshop" 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#231916]/95 via-[#231916]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#231916]/30 to-[#fff8f6]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Card */}
            <div className="lg:col-span-7 text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#de6b48]/20 border border-[#de6b48]/45 rounded-full px-4.5 py-1.5 text-xs text-[#ff9e80] font-bold tracking-wide uppercase backdrop-blur-sm animate-pulse">
                <SparklesIcon className="w-4 h-4" />
                Ahşap & Marangozluk Hizmeti Aktif!
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Hayalinizdeki Tasarımın <br />
                <span className="text-[#de6b48] relative">
                  Aynısını Yaptırın!
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-[#de6b48]/30 -z-10 rounded-full" />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#ddc0b9] leading-relaxed max-w-xl">
                Pinterest'te gördüğünüz, çizdiğiniz veya hayal ettiğiniz ahşap mobilyaların fotoğrafını yükleyin. Usta zanaatkârlar sizin için sıfırdan, el emeğiyle aynısını üretsin.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register" className="btn-primary text-center px-8 py-4.5 text-base shadow-xl hover:shadow-2xl hover:bg-[#c45a38] flex items-center justify-center gap-2 rounded-xl group transition-all duration-300">
                  Fotoğraf Yükle & Teklif Al
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#nasil-calisir" className="bg-white/10 hover:bg-white/20 text-white font-bold text-center px-8 py-4.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all text-base flex items-center justify-center gap-2">
                  Nasıl Çalışır?
                </a>
              </div>

              {/* Trust badges */}
              <div className="pt-8 border-t border-[#fff8f6]/10 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-6 h-6 text-[#de6b48]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#ddc0b9]">Param-Güvende Escrow Sistemi</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-[#3c2a25] border-2 border-[#231916] flex items-center justify-center text-[#ff9e80] text-xs font-bold font-sans">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarSolid key={s} className="w-4 h-4 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-[#ddc0b9] mt-0.5 font-medium">
                      <span className="font-bold text-white">500+</span> mutlu özel üretim
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Status Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="glass-panel-dark text-white p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#de6b48]/10 rounded-full blur-2xl" />
                <h3 className="text-lg font-extrabold text-[#de6b48] tracking-wide uppercase mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  Zanaat Durum Masası
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-[#de6b48] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Ahşap & Mobilya</h4>
                      <p className="text-xs text-[#ddc0b9] mt-0.5">70+ Marangoz Ustası teklife hazır.</p>
                      <span className="inline-flex mt-2 text-[10px] bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold">AKTİF</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3 opacity-60">
                    <span className="text-xl mt-0.5">🧶</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Terzi & Nakış</h4>
                      <p className="text-xs text-[#ddc0b9] mt-0.5">Zanaatkar alımları devam ediyor.</p>
                      <span className="inline-flex mt-2 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-bold">ÇOK YAKINDA</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#ddc0b9]">
                  <span>Atölyeler Çevrimiçi</span>
                  <span className="flex items-center gap-1.5 font-bold text-green-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Before & After Slider Section ────────────────────── */}
      <section id="pinterest-to-product" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Subtle grid elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#de6b48_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#de6b48]">Görselden Gerçeğe</h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#231916] leading-tight">
              Siz Çizin Veya Fotoğrafını Çekin, Ustalarımız Üretsin!
            </h2>
            <p className="text-base sm:text-lg text-[#56423d]">
              Aşağıdaki karşılaştırma sürgüsünü kaydırarak bir müşterimizin Pinterest'te gördüğü <span className="font-bold text-[#de6b48]">modern ahşap koltuk eskizi</span> ile marangozumuzun elinden çıkan <span className="font-bold text-[#231916]">masif ceviz koltuk</span> arasındaki muhteşem benzerliği görün.
            </p>
          </div>

          {/* Interactive Drag Slider Container */}
          <div className="max-w-4xl mx-auto">
            <div 
              ref={containerRef}
              onMouseDown={startDrag}
              onTouchStart={startTouchDrag}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-[#e9d6d1] select-none cursor-ew-resize group"
            >
              {/* Left Side Image: Inspiration Sketch */}
              <div className="absolute inset-0">
                <Image 
                  src="/chair_design_inspiration.png" 
                  alt="Müşterinin Gönderdiği Tasarım Eskizi" 
                  fill 
                  className="object-cover"
                  priority
                />
                {/* Visual Label Left */}
                <div className="absolute bottom-6 left-6 z-20 bg-[#231916]/80 text-[#fff8f6] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  1. Müşterinin Tasarım Eskizi (Görsel)
                </div>
              </div>

              {/* Right Side Image: Crafted Product (Clipped) */}
              <div 
                className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                <Image 
                  src="/chair_finished_product.png" 
                  alt="Zanaatkarın Elde Ürettiği Gerçek Ürün" 
                  fill 
                  className="object-cover"
                  priority
                />
                {/* Visual Label Right */}
                <div className="absolute bottom-6 right-6 z-20 bg-[#de6b48]/90 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                  2. Zanaatkârın El Yapımı Eseri (%100 Aynısı)
                </div>
              </div>

              {/* Splitter Line & Drag Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg pointer-events-none z-20"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                {/* Pulse Glow Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-12 h-12 rounded-full bg-white shadow-2xl border-4 border-[#de6b48] flex items-center justify-center cursor-ew-resize transition-transform duration-100 group-hover:scale-110">
                  <div className="flex gap-1">
                    <span className="w-1 h-4 bg-[#de6b48] rounded-full animate-pulse"></span>
                    <span className="w-1 h-4 bg-[#de6b48] rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>

              {/* Helper Drag Prompt Overlay */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#231916]/80 text-white/90 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm pointer-events-none animate-bounce">
                Sola/Sağa Kaydırın
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-6 text-sm text-[#56423d]">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                El Yapımı Masif Ceviz Geleneksel İşçilik
              </span>
              <span className="flex items-center gap-2 font-medium">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                Özel Ölçü ve Malzeme Seçimi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Nasıl Çalışır Section (Blueprint Style) ─────────────── */}
      <section id="nasil-calisir" className="py-24 sm:py-32 bg-blueprint-grid border-y border-[#e9d6d1]/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-sm font-bold uppercase tracking-widest text-[#de6b48]">Süreç Planı</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#231916]">
              4 Adımda Güvenli Custom Üretim
            </h2>
            <p className="text-base text-[#56423d]">
              Fikrinizden bitmiş esere kadar her detay zanaatkar hassasiyeti ve güvenceyle yürür.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Tasarım Fikrini Paylaş',
                desc: 'Aklındaki mobilyanın çizimini, Pinterest fotoğrafını ya da referans görsellerini yükle. Boyutları ve malzeme tercihini kısaca yaz.',
                icon: <ShoppingBagIcon className="w-6 h-6" />
              },
              {
                step: '02',
                title: 'Teklifleri Karşılaştır',
                desc: 'Talebin marangozlarımıza iletilir. Ustalardan gelen fiyat, ahşap türü ve teslim süresi içeren detaylı teklifleri karşılaştır, en iyisini seç.',
                icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />
              },
              {
                step: '03',
                title: 'Güvenli Üretime Başla',
                desc: 'Teklifi kabul edip ödemeyi havuz hesaba aktar. Ödemen, zanaatkar üretimi yapıp sen ürünü teslim alıp onaylayana kadar güvende kalır.',
                icon: <WrenchScrewdriverIcon className="w-6 h-6" />
              },
              {
                step: '04',
                title: 'Aynısını Teslim Al',
                desc: 'Zanaatkarın üretip kargo/lojistik ile gönderdiği eseri evinde incele. Tasarıma uygunluğu onaylandığında bakiye zanaatkara aktarılır.',
                icon: <TruckIcon className="w-6 h-6" />
              }
            ].map((item, idx) => (
              <div key={idx} className="relative scroll-reveal">
                {/* Blueprint style card container */}
                <div className="bg-white/95 rounded-2xl p-8 border-2 border-dashed border-[#ddc0b9] hover:border-[#de6b48] transition-all duration-300 shadow-md hover:shadow-xl h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-5xl font-black text-[#de6b48]/10 group-hover:text-[#de6b48]/20 transition-colors">
                        {item.step}
                      </span>
                      <div className="w-11 h-11 bg-[#feeae5] rounded-xl flex items-center justify-center text-[#de6b48] group-hover:scale-110 transition-transform shadow-sm">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-[#231916] group-hover:text-[#de6b48] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#56423d] leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#e9d6d1]/40 text-xs text-[#de6b48] font-bold flex items-center gap-1">
                    Adım Detayları <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                {/* Arrow connectors for desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRightIcon className="w-6 h-6 text-[#de6b48]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories & Roadmap Section ───────────────────────── */}
      <section id="kategoriler" className="py-24 sm:py-32 bg-[#fff8f6] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#feeae5]/30 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-sm font-bold uppercase tracking-widest text-[#de6b48]">Zanaat Yelpazesi</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#231916]">
              Tüm Zanaat Dallarını Tek Çatıda Buluşturuyoruz
            </h2>
            <p className="text-base sm:text-lg text-[#56423d]">
              İlk olarak usta marangozlarımızla ahşap işleri için açıldık. Çok yakında dikiş ustaları, ressamlar, cam ve porselen sanatçıları da platformumuza katılarak hayallerinizi gerçeğe dönüştürecek.
            </p>
          </div>

          {/* Grid Layout of Categories */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((cat, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-3xl overflow-hidden border transition-all duration-300 scroll-reveal ${
                  cat.active 
                    ? 'bg-white border-[#de6b48] shadow-lg hover:shadow-2xl scale-[1.02] p-8' 
                    : 'glass-panel border-[#e9d6d1]/60 p-8 group opacity-90 hover:opacity-100'
                }`}
              >
                {/* Lock Overlay for non-active categories */}
                {!cat.active && (
                  <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-[#231916]/5 to-[#231916]/10 pointer-events-none rounded-3xl" />
                )}

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                        cat.active ? 'bg-[#feeae5] text-[#de6b48] border border-[#de6b48]/20' : 'bg-[#f2ded9]/50 text-gray-500'
                      }`}>
                        {cat.icon}
                      </div>
                      
                      {cat.active ? (
                        <span className="inline-flex text-[10px] bg-[#de6b48]/10 border border-[#de6b48]/30 text-[#de6b48] px-3 py-1 rounded-full font-bold tracking-wider uppercase">
                          {cat.badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#231916]/5 border border-[#231916]/10 text-[#56423d] px-3 py-1 rounded-full font-bold tracking-wider uppercase backdrop-blur-sm">
                          <LockClosedIcon className="w-3 h-3 text-[#de6b48]" />
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-extrabold text-[#231916] mb-3">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-[#56423d] leading-relaxed mb-6 font-medium">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Footer status */}
                  <div className={`pt-4 border-t flex items-center justify-between text-xs font-bold ${
                    cat.active ? 'border-[#de6b48]/20 text-[#de6b48]' : 'border-[#e9d6d1]/40 text-[#56423d]/70'
                  }`}>
                    <span>{cat.count}</span>
                    {cat.active ? (
                      <Link href="/register" className="flex items-center gap-1 hover:underline">
                        Hemen Talep Aç <ChevronRightIcon className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 opacity-70">
                        Sıraya Gir <ClockIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Artisan Showcase Section ───────────────────────────── */}
      <section id="zanaatkarlar" className="py-24 sm:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-sm font-bold uppercase tracking-widest text-[#de6b48]">Ustalarımızın Elleri</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#231916]">
              Özel Üretim Yapan Master Zanaatkârlar
            </h2>
            <p className="text-base text-[#56423d]">
              Uzun yıllar atölyesinde ahşap işlemiş, referansları doğrulanmış en yetkin ustalarımızdan bazıları.
            </p>
          </div>

          {/* Artisan Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {ARTISANS.map((artisan, idx) => (
              <div key={idx} className="bg-[#fff8f6] rounded-3xl border border-[#e9d6d1]/80 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group scroll-reveal">
                <div>
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 pb-6 border-b border-[#e9d6d1]/40">
                    <div className="w-14 h-14 rounded-2xl bg-[#feeae5] border border-[#de6b48]/30 flex items-center justify-center text-[#de6b48] font-black text-lg shadow-inner">
                      {artisan.initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#231916] group-hover:text-[#de6b48] transition-colors">
                        {artisan.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#de6b48] bg-[#feeae5] px-2 py-0.5 rounded-md">
                          {artisan.badge}
                        </span>
                        <span className="text-xs text-[#56423d] font-semibold">
                          {artisan.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between py-4 text-xs font-bold text-[#56423d]">
                    <div className="flex items-center gap-1.5">
                      <StarSolid className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-extrabold text-[#231916]">{artisan.rating}</span>
                      <span className="opacity-80">({artisan.reviews} Değerlendirme)</span>
                    </div>
                    <span>{artisan.location}</span>
                  </div>

                  {/* Specialties */}
                  <div className="py-4">
                    <h4 className="text-xs font-bold text-[#231916] uppercase tracking-wider mb-2">Uzmanlık Alanları</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {artisan.specialties.map((spec, sIdx) => (
                        <span key={sIdx} className="text-xs bg-white text-[#56423d] px-2.5 py-1 rounded-lg border border-[#e9d6d1]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Past Works Mock Showcase */}
                  <div className="py-4">
                    <h4 className="text-xs font-bold text-[#231916] uppercase tracking-wider mb-3">Son Özel Siparişleri</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {artisan.works.map((work, wIdx) => (
                        <div key={wIdx} className="bg-white rounded-xl p-2 border border-[#e9d6d1]/60 flex flex-col justify-between h-20 text-center shadow-inner hover:bg-[#feeae5]/20 cursor-default transition-all duration-200">
                          <span className="text-[10px] font-black text-[#de6b48] leading-tight block line-clamp-2">
                            {work.title}
                          </span>
                          <span className="text-[8px] text-[#56423d] font-medium truncate block">
                            {work.details}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#e9d6d1]/40 flex items-center justify-between">
                  <span className="text-xs text-[#56423d] font-bold">Müşteri Puanı %100 Memnuniyet</span>
                  <Link href="/register" className="btn-outline-primary text-xs px-4 py-2 hover:bg-[#de6b48] hover:text-white transition-all rounded-lg">
                    Ustanın Profilini Gör
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security Param-Güvende Section ─────────────────────── */}
      <section id="guvenlik" className="py-24 sm:py-32 bg-blueprint-grid border-t border-[#e9d6d1]/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-6 scroll-reveal">
              <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-1.5 text-xs text-green-700 font-bold border border-green-200 uppercase tracking-wider">
                <ShieldCheckIcon className="w-4 h-4 text-green-600 animate-pulse" />
                Ödeme Güvenlik Kalkanı
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#231916] leading-tight">
                Param-Güvende Güvencesiyle <br />
                <span className="text-[#de6b48]">Sıfır Riskli</span> Alışveriş
              </h2>
              <p className="text-base sm:text-lg text-[#56423d] leading-relaxed font-medium">
                Geleneksel el sanatlarında sipariş vermek artık riskli değil. Platformumuzun ödeme güvencesiyle, yaptırdığınız özel eseri teslim alıp doğruluğunu onaylamadan ödemeniz zanaatkara aktarılmaz.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  { title: 'Havuz Hesap Sistemi', desc: 'Ödemeniz Aynısından korumalı banka hesabında bloke edilir.' },
                  { title: 'Üretim Süreci Takibi', desc: 'Ustanız üretirken size aşama aşama fotoğraf ve detay iletir.' },
                  { title: 'Kontrollü Teslimat', desc: 'Ürünü kargodan teslim alıp incelemeniz için 3 iş günü hakkınız vardır.' },
                  { title: 'Kolay İptal & İade', desc: 'Tasarım görselinden farklı bir ürün gelirse bedelsiz iade başlar.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0 font-bold text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#231916]">{item.title}</h4>
                      <p className="text-xs text-[#56423d] font-semibold mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Widget */}
            <div className="relative scroll-reveal">
              <div className="absolute inset-0 bg-[#de6b48]/5 rounded-3xl blur-3xl -z-10" />
              <div className="bg-white rounded-3xl border border-[#e9d6d1] p-10 shadow-xl relative">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
                    <ShieldCheckIcon className="w-11 h-11 text-green-600 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#231916] mb-2">Param-Güvende</h3>
                  <p className="text-sm text-[#56423d] font-medium">Banka ortaklı güvenli ödeme cüzdanı.</p>
                  
                  {/* Three quick stat blocks */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="bg-[#fff8f6] rounded-2xl p-4 border border-[#e9d6d1]/60">
                      <p className="text-2xl font-black text-[#de6b48]">₺0</p>
                      <p className="text-[10px] text-[#56423d] font-extrabold mt-1 uppercase tracking-wide">Komisyon</p>
                    </div>
                    <div className="bg-[#fff8f6] rounded-2xl p-4 border border-[#e9d6d1]/60">
                      <p className="text-2xl font-black text-[#de6b48]">7/24</p>
                      <p className="text-[10px] text-[#56423d] font-extrabold mt-1 uppercase tracking-wide">Canlı Destek</p>
                    </div>
                    <div className="bg-[#fff8f6] rounded-2xl p-4 border border-[#e9d6d1]/60">
                      <p className="text-2xl font-black text-[#de6b48]">%100</p>
                      <p className="text-[10px] text-[#56423d] font-extrabold mt-1 uppercase tracking-wide">Güvenli</p>
                    </div>
                  </div>

                  {/* Flow Steps graphic */}
                  <div className="mt-8 border-t border-[#e9d6d1]/60 pt-6">
                    <h4 className="text-xs font-bold text-[#231916] uppercase tracking-wider text-left mb-4">Sipariş İşlem Döngüsü</h4>
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#56423d]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-7 h-7 rounded-full bg-[#de6b48] text-white flex items-center justify-center font-mono">1</span>
                        <span>Havuz Ödeme</span>
                      </div>
                      <div className="w-12 h-0.5 bg-[#de6b48]/30 border-dashed border-t border-[#de6b48]"></div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-7 h-7 rounded-full bg-[#de6b48] text-white flex items-center justify-center font-mono">2</span>
                        <span>Usta Üretimi</span>
                      </div>
                      <div className="w-12 h-0.5 bg-[#de6b48]/30 border-dashed border-t border-[#de6b48]"></div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-7 h-7 rounded-full bg-[#de6b48] text-white flex items-center justify-center font-mono">3</span>
                        <span>Onay & Transfer</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Call to Action (CTA) Section ───────────────────────── */}
      <section className="py-24 sm:py-32 bg-[#de6b48] relative overflow-hidden">
        {/* Subtle background abstract shapes */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Hayal Ettiğiniz Eseri <br />Gerçeğe Dönüştürün!
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Hemen ücretsiz kaydolun, yaptırmak istediğiniz ahşap tasarımın görselini yükleyin ve usta zanaatkârlarımızdan size özel malzeme ve fiyat teklifleri almaya başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register" className="bg-[#231916] text-white font-bold px-8 py-4.5 rounded-xl hover:bg-black transition-all text-base shadow-lg flex items-center justify-center gap-2 group">
              Müşteri Olarak Kaydol
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="bg-transparent text-white font-bold px-8 py-4.5 rounded-xl border-2 border-white hover:bg-white/10 transition-all text-base flex items-center justify-center gap-2">
              Zanaatkâr Başvurusu Yap
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#231916] text-[#ddc0b9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Image src="/logo.svg" alt="Aynısından Logo" width={28} height={28} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base leading-tight tracking-wide">Aynısından</h3>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider -mt-0.5">isteyenlerin pazarı!</p>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                Pinterest'te gördüğünüz, çizdiğiniz veya hayal ettiğiniz her türlü özel tasarım eseri usta zanaatkârlar vasıtasıyla güven içinde sıfırdan üreten güvenli el yapımı pazarı.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Hızlı Gezinti</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li><a href="#pinterest-to-product" className="hover:text-white transition-colors">Örnek Karşılaştırma</a></li>
                <li><a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a></li>
                <li><a href="#kategoriler" className="hover:text-white transition-colors">Kategoriler & Yol Haritası</a></li>
                <li><a href="#zanaatkarlar" className="hover:text-white transition-colors">Doğrulanmış Ustalarımız</a></li>
              </ul>
            </div>

            {/* Column 3: Account & Help */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Hesap İşlemleri</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li><Link href="/login" className="hover:text-white transition-colors">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Müşteri Hesabı Aç</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Zanaatkâr Atölyesi Aç</Link></li>
                <li><a href="#guvenlik" className="hover:text-white transition-colors">Param-Güvende Yardımı</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">İletişim & Destek</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-white/70">
                <li>E-posta: destek@aynisindan.com</li>
                <li>Atölye Hattı: +90 555 123 4567</li>
                <li>Adres: Maslak Sanayi Mahallesi, İstanbul</li>
              </ul>
            </div>

          </div>

          {/* Sub-footer Copyright */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/40">
            <p>
              2026 Aynısından. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <ShieldCheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              Param-Güvende ile güvenli alışveriş
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
