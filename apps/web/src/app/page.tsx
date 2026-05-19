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
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fff8f6]">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#fff8f6]/95 backdrop-blur-sm border-b border-[#e9d6d1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Aynısından" width={40} height={40} className="object-contain" />
              <div>
                <h1 className="text-[#de6b48] font-bold text-base leading-tight">Aynısından</h1>
                <p className="text-[#56423d] text-[10px] -mt-0.5">isteyenlerin pazarı!</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#56423d]">
              <a href="#nasil-calisir" className="hover:text-[#de6b48] transition-colors">Nasıl Çalışır</a>
              <a href="#kategoriler" className="hover:text-[#de6b48] transition-colors">Kategoriler</a>
              <a href="#guvenlik" className="hover:text-[#de6b48] transition-colors">Güvenlik</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-[#56423d] hover:text-[#de6b48] transition-colors">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
                Hesap Oluştur
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#feeae5] via-[#fff8f6] to-[#fff1ed]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#fff1ed] border border-[#ddc0b9] rounded-full px-4 py-1.5 text-sm text-[#de6b48] font-medium mb-6">
                <ShieldCheckIcon className="w-4 h-4" />
                Param-Güvende ile güvenli alışveriş
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#231916] leading-tight">
                Geleneksel El Sanatlarının{' '}
                <span className="text-[#de6b48]">Güvenli Pazarı</span>
              </h1>
              <p className="mt-6 text-lg text-[#56423d] leading-relaxed max-w-xl">
                Usta zanaatkârlarla buluşun, özel eserler sipariş edin. Ödemeniz, teslimi onaylayana kadar güvende.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary text-center px-8 py-4 text-base">
                  Hemen Başla
                </Link>
                <a href="#nasil-calisir" className="btn-secondary text-center px-8 py-4 text-base">
                  Nasıl Çalışır?
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-[#f2ded9] border-2 border-white flex items-center justify-center text-[#de6b48] text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarSolid key={s} className="w-4 h-4 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#56423d] mt-0.5">
                    <span className="font-semibold text-[#231916]">500+</span> mutlu müşteri
                  </p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-4 bg-[#de6b48]/10 rounded-3xl rotate-3" />
                <div className="absolute inset-4 bg-[#feeae5] rounded-3xl -rotate-3" />
                <div className="relative w-full h-full bg-white rounded-3xl border border-[#e9d6d1] shadow-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto bg-[#feeae5] rounded-2xl flex items-center justify-center mb-6">
                      <WrenchScrewdriverIcon className="w-16 h-16 text-[#de6b48]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#231916] mb-2">Özel Tasarım</h3>
                    <p className="text-[#56423d] text-sm">Hayalinizdeki eseri zanaatkârlarla birlikte üretin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Nasıl Çalışır ──────────────────────────────────────── */}
      <section id="nasil-calisir" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#231916]">Nasıl Çalışır?</h2>
            <p className="mt-4 text-lg text-[#56423d] max-w-2xl mx-auto">
              4 kolay adımda hayalinizdeki özel esere kavuşun.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShoppingBagIcon className="w-8 h-8" />,
                step: '01',
                title: 'Sipariş Oluştur',
                desc: 'İstediğiniz eseri tanımlayın, referans görsellerinizi ekleyin.',
              },
              {
                icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
                step: '02',
                title: 'Teklifleri İncele',
                desc: 'Zanaatkârlardan gelen teklifleri karşılaştırın.',
              },
              {
                icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
                step: '03',
                title: 'Üretim Başlasın',
                desc: 'Teklifi kabul edin, zanaatkâr üretimine başlasın.',
              },
              {
                icon: <TruckIcon className="w-8 h-8" />,
                step: '04',
                title: 'Teslim Al',
                desc: 'Eseriniz teslim edildiğinde ödemeyi onaylayın.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-[#fff8f6] rounded-2xl p-8 border border-[#e9d6d1] hover:border-[#de6b48] hover:shadow-lg transition-all duration-300 h-full">
                  <span className="text-5xl font-bold text-[#f2ded9]">{item.step}</span>
                  <div className="mt-4 w-14 h-14 bg-[#feeae5] rounded-xl flex items-center justify-center text-[#de6b48]">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#231916]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#56423d] leading-relaxed">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRightIcon className="w-8 h-8 text-[#ddc0b9]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Kategoriler ────────────────────────────────────────── */}
      <section id="kategoriler" className="py-20 sm:py-24 bg-[#fff8f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#231916]">Popüler Kategoriler</h2>
            <p className="mt-4 text-lg text-[#56423d] max-w-2xl mx-auto">
              Her türlü özel eser için usta zanaatkârlar hazır.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Mobilya', desc: 'Özel tasarım masa, sandalye, dolap ve daha fazlası', icon: '🪑', count: '120+ Zanaatkâr' },
              { title: 'Dekorasyon', desc: 'Duvar süsleri, avizeler, el yapımı aksesuarlar', icon: '🏺', count: '85+ Zanaatkâr' },
              { title: 'Tekstil', desc: 'El dokuması halı, kilim, yastık ve örtüler', icon: '🧶', count: '60+ Zanaatkâr' },
              { title: 'Takı & Aksesuar', desc: 'Gümüş, bakır ve özel tasarım takılar', icon: '💍', count: '95+ Zanaatkâr' },
              { title: 'Seramik & Cam', desc: 'El yapımı seramik, çini ve cam eserler', icon: '🫖', count: '45+ Zanaatkâr' },
              { title: 'Ahşap İşçiliği', desc: 'Oyma, kakma ve özel ahşap eserler', icon: '🪵', count: '70+ Zanaatkâr' },
            ].map((cat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#e9d6d1] p-6 hover:border-[#de6b48] hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-lg font-bold text-[#231916] group-hover:text-[#de6b48] transition-colors">{cat.title}</h3>
                <p className="mt-1 text-sm text-[#56423d]">{cat.desc}</p>
                <p className="mt-3 text-xs font-semibold text-[#de6b48]">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Güvenlik / Param-Güvende ───────────────────────────── */}
      <section id="guvenlik" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-1.5 text-sm text-green-700 font-medium mb-6">
                <ShieldCheckIcon className="w-4 h-4" />
                Güvenli Alışveriş
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#231916]">
                Param-Güvende ile{' '}
                <span className="text-[#de6b48]">Güvenli Ödeme</span>
              </h2>
              <p className="mt-6 text-lg text-[#56423d] leading-relaxed">
                Ödemeniz, siz teslimi onaylayana kadar güvende tutulur. Zanaatkâr, ancak siz onay verdikten sonra ödemesini alır.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Sipariş verdiğinizde ödeme Param-Güvende hesabında tutulur',
                  'Zanaatkâr eseri üretir ve size teslim eder',
                  'Teslimi onayladığınızda ödeme zanaatkâra aktarılır',
                  'Sorun yaşarsanız destek ekibimiz yanınızda',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[#56423d]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#fff8f6] rounded-3xl border border-[#e9d6d1] p-10">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheckIcon className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#231916] mb-2">Param-Güvende</h3>
                  <p className="text-[#56423d]">Güvenli ödeme altyapımız ile içiniz rahat.</p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[#e9d6d1]">
                      <p className="text-2xl font-bold text-[#de6b48]">₺0</p>
                      <p className="text-xs text-[#56423d] mt-1">Komisyon</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#e9d6d1]">
                      <p className="text-2xl font-bold text-[#de6b48]">7/24</p>
                      <p className="text-xs text-[#56423d] mt-1">Destek</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#e9d6d1]">
                      <p className="text-2xl font-bold text-[#de6b48]">%100</p>
                      <p className="text-xs text-[#56423d] mt-1">Güvenli</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-[#de6b48]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Hayalinizdeki Eseri Üretmeye Hazır mısınız?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Hemen hesap oluşturun, ilk siparişinizi verin ve geleneksel el sanatlarının dünyasına adım atın.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-[#de6b48] font-semibold px-8 py-4 rounded-lg hover:bg-[#fff1ed] transition-all duration-150 text-base">
              Ücretsiz Hesap Oluştur
            </Link>
            <Link href="/login" className="bg-transparent text-white font-semibold px-8 py-4 rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-150 text-base">
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#231916] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.svg" alt="Aynısından" width={40} height={40} className="object-contain" />
                <div>
                  <h3 className="text-[#de6b48] font-bold text-base">Aynısından</h3>
                  <p className="text-white/60 text-[10px] -mt-0.5">isteyenlerin pazarı!</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Geleneksel el sanatlarını dijital dünyada buluşturan güvenli pazar yeri.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#nasil-calisir" className="hover:text-[#de6b48] transition-colors">Nasıl Çalışır</a></li>
                <li><a href="#kategoriler" className="hover:text-[#de6b48] transition-colors">Kategoriler</a></li>
                <li><a href="#guvenlik" className="hover:text-[#de6b48] transition-colors">Güvenlik</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Hesap</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link href="/login" className="hover:text-[#de6b48] transition-colors">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-[#de6b48] transition-colors">Hesap Oluştur</Link></li>
                <li><Link href="/orders" className="hover:text-[#de6b48] transition-colors">Siparişlerim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">İletişim</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>info@aynisindan.com</li>
                <li>+90 555 123 4567</li>
                <li>İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              2026 Aynısından. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <ShieldCheckIcon className="w-4 h-4" />
              Param-Güvende ile güvenli alışveriş
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
