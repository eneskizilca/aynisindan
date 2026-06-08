'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, SparklesIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ImageItem {
  id: string;
  url: string;
  author: string;
  title: string;
  categories: string[];
}

const FALLBACK_IMAGES: ImageItem[] = [
  // Sandalyeler / Koltuklar
  {
    id: 'f1',
    url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
    author: 'Sven Brandsma',
    title: 'Modern Sarı Tekli Koltuk',
    categories: ['chair', 'sandalye', 'koltuk', 'furniture', 'mobilya']
  },
  {
    id: 'f2',
    url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
    author: 'Radek Grzybowski',
    title: 'İskandinav Tarzı Ahşap Koltuk',
    categories: ['chair', 'sandalye', 'koltuk', 'furniture', 'mobilya']
  },
  {
    id: 'f3',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    author: 'Philippaurora',
    title: 'Mid-Century Modern Sandalye',
    categories: ['chair', 'sandalye', 'koltuk', 'furniture', 'mobilya']
  },
  {
    id: 'f4',
    url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
    author: 'Sarah Dorweiler',
    title: 'Minimalist Ahşap Tabure',
    categories: ['chair', 'sandalye', 'tabure', 'furniture', 'mobilya']
  },
  {
    id: 'f5',
    url: 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?auto=format&fit=crop&w=600&q=80',
    author: 'Kari Shea',
    title: 'Rustik Ahşap Sandalye',
    categories: ['chair', 'sandalye', 'furniture', 'mobilya']
  },
  {
    id: 'f6',
    url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=600&q=80',
    author: 'Andrea Davis',
    title: 'Zarif Yemek Masası Sandalyesi',
    categories: ['chair', 'sandalye', 'furniture', 'mobilya']
  },
  // Masalar
  {
    id: 'f7',
    url: 'https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&w=600&q=80',
    author: 'Taylor Simpson',
    title: 'Masif Ahşap Yemek Masası',
    categories: ['table', 'masa', 'dining', 'furniture', 'mobilya']
  },
  {
    id: 'f8',
    url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
    author: 'Sven Brandsma',
    title: 'Modern Ahşap Orta Sehpa',
    categories: ['table', 'sehpa', 'coffee table', 'furniture', 'mobilya']
  },
  {
    id: 'f9',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    author: 'Mitchel 3D',
    title: 'Doğal Ahşap Kütük Sehpa',
    categories: ['table', 'sehpa', 'furniture', 'mobilya']
  },
  {
    id: 'f10',
    url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80',
    author: 'Nathan Dumlao',
    title: 'Minimal Çalışma Masası',
    categories: ['table', 'desk', 'masa', 'furniture', 'mobilya']
  },
  {
    id: 'f11',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    author: 'Zoltan Tasi',
    title: 'Doğal Kenarlı Ahşap Masa',
    categories: ['table', 'masa', 'furniture', 'mobilya']
  },
  // Kitaplıklar / Dolaplar
  {
    id: 'f12',
    url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    author: 'Inaki del Olmo',
    title: 'Duvara Monte Ahşap Kitaplık',
    categories: ['shelf', 'bookshelf', 'kitaplik', 'raf', 'furniture', 'mobilya']
  },
  {
    id: 'f13',
    url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
    author: 'Sven Brandsma',
    title: 'Mid-Century Retro Büfe Konsol',
    categories: ['cabinet', 'dolap', 'console', 'furniture', 'mobilya']
  },
  {
    id: 'f14',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    author: 'Clayton Cardinalli',
    title: 'Ahşap Çekmeceli Düzenleyici',
    categories: ['drawer', 'cekmese', 'furniture', 'mobilya']
  },
  // Seramik & Cam
  {
    id: 'f15',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    author: 'Tom Crew',
    title: 'El Yapımı Seramik Kupalar',
    categories: ['ceramic', 'seramik', 'pottery', 'kupa', 'bardak']
  },
  {
    id: 'f16',
    url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80',
    author: 'Zane Persaud',
    title: 'Toprak Seramik Vazo',
    categories: ['ceramic', 'seramik', 'pottery', 'vazo', 'vase']
  },
  {
    id: 'f17',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    author: 'Kari Shea',
    title: 'Minimalist Seramik Çiçeklik',
    categories: ['ceramic', 'seramik', 'pottery', 'vazo', 'vase']
  },
  {
    id: 'f18',
    url: 'https://images.unsplash.com/photo-1525974738370-df1eabdf8553?auto=format&fit=crop&w=600&q=80',
    author: 'Lina Castaneda',
    title: 'Geleneksel Sırlı Çömlek',
    categories: ['ceramic', 'seramik', 'pottery']
  },
  // Deri / Tekstil
  {
    id: 'f19',
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    author: 'Kseniia Yakubova',
    title: 'El Dikişi Deri Sırt Çantası',
    categories: ['leather', 'deri', 'canta', 'bag']
  },
  {
    id: 'f20',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    author: 'Julius Drost',
    title: 'Minimalist Deri Kartlık Cüzdan',
    categories: ['leather', 'deri', 'cuzdan', 'wallet']
  },
  {
    id: 'f21',
    url: 'https://images.unsplash.com/photo-1624273830596-3c217f27651a?auto=format&fit=crop&w=600&q=80',
    author: 'Ares J.hna',
    title: 'El Yapımı Deri Atölye Çalışması',
    categories: ['leather', 'deri', 'craft']
  },
  // Takı / Aksesuar
  {
    id: 'f22',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    author: 'Jonas Svidras',
    title: 'Dövme Gümüş Yüzükler',
    categories: ['jewelry', 'taki', 'ring', 'yuzuk']
  },
  {
    id: 'f23',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    author: 'Sandy Millar',
    title: 'El İşçiliği Altın Alyans',
    categories: ['jewelry', 'taki', 'ring', 'yuzuk']
  },
  {
    id: 'f24',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    author: 'Mitchel 3D',
    title: 'Bohem Tarzı Küpeler',
    categories: ['jewelry', 'taki', 'earrings', 'kupe']
  },
  // Metal
  {
    id: 'f25',
    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
    author: 'Jannis Lucas',
    title: 'Metal ve Ahşap Ayaklı Sehpa',
    categories: ['metal', 'table', 'masa', 'furniture', 'mobilya']
  },
  // Dekorasyon / Aydınlatma
  {
    id: 'f26',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    author: 'Charlotte May',
    title: 'Retro Tel Sarkıt Lamba',
    categories: ['lighting', 'lamba', 'lamp', 'dekorasyon', 'aydinlatma']
  },
  {
    id: 'f27',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    author: 'Kari Shea',
    title: 'El Yapımı Makrome Duvar Süsü',
    categories: ['dekorasyon', 'macrame', 'makrome', 'textile']
  },
  // Ek Mobilyalar
  {
    id: 'f28',
    url: 'https://images.unsplash.com/photo-1595514534835-f4842a1f103b?auto=format&fit=crop&w=600&q=80',
    author: 'Sven Brandsma',
    title: 'Masif Ahşap Komodin',
    categories: ['cabinet', 'komodin', 'furniture', 'mobilya']
  },
  {
    id: 'f29',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    author: 'Spacejoy',
    title: 'Rustik Ahşap Ayna Çerçevesi',
    categories: ['dekorasyon', 'mirror', 'ayna', 'furniture', 'mobilya']
  },
  {
    id: 'f30',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    author: 'R-Architecture',
    title: 'Özel Tasarım Mutfak Rafı',
    categories: ['shelf', 'raf', 'furniture', 'mobilya']
  },
  {
    id: 'f31',
    url: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=600&q=80',
    author: 'Federico Beccari',
    title: 'Endüstriyel Boru Kitaplık',
    categories: ['shelf', 'bookshelf', 'kitaplik', 'furniture', 'mobilya']
  },
  {
    id: 'f32',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    author: 'Sven Brandsma',
    title: 'Modern Yeşil Kadife Kanepe',
    categories: ['sofa', 'kanepe', 'koltuk', 'furniture', 'mobilya']
  }
];

const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const isKeyValid = ACCESS_KEY && 
                   ACCESS_KEY !== 'undefined' && 
                   ACCESS_KEY !== 'null' && 
                   ACCESS_KEY.trim() !== '' && 
                   !ACCESS_KEY.includes('YOUR_ACCESS_KEY');

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const COMMON_TRANSLATIONS: { [key: string]: string } = {
  'masa': 'table',
  'sandalye': 'chair',
  'koltuk': 'armchair',
  'sehpa': 'coffee table',
  'tabure': 'stool',
  'kitaplik': 'bookshelf',
  'raf': 'shelf',
  'dolap': 'cabinet',
  'komodin': 'nightstand',
  'mutfak': 'kitchen',
  'ahsap': 'wooden',
  'metal': 'metal',
  'seramik': 'ceramic',
  'potteri': 'pottery',
  'comlek': 'pottery',
  'vazo': 'vase',
  'kupa': 'mug',
  'bardak': 'cup',
  'deri': 'leather',
  'canta': 'bag',
  'cuzdan': 'wallet',
  'taki': 'jewelry',
  'yuzuk': 'ring',
  'kolye': 'necklace',
  'kupe': 'earrings',
  'lamba': 'lamp',
  'aydinlatma': 'lighting',
  'ayna': 'mirror',
  'kanepe': 'sofa',
  'yatak': 'bed'
};

const translateToEnglish = async (query: string): Promise<string> => {
  if (!query) return '';
  
  const cleanQuery = normalizeText(query).trim();
  console.log('🔄 [Translation] Orijinal sorgu:', query, '| Temizlenmiş:', cleanQuery);

  // 1. Tek kelimelik hızlı çeviri sözlüğü kontrolü
  if (COMMON_TRANSLATIONS[cleanQuery]) {
    const localResult = COMMON_TRANSLATIONS[cleanQuery];
    console.log('🔄 [Translation] Yerel sözlük eşleşmesi:', localResult);
    return localResult;
  }

  // Çoklu kelimeler için kelime bazlı yerel kontrol
  const words = cleanQuery.split(/\s+/);
  const localTranslatedWords = words.map(w => COMMON_TRANSLATIONS[w] || w);
  const localSentence = localTranslatedWords.join(' ');
  
  // 2. Ücretsiz canlı çeviri API'si (MyMemory) denemesi
  try {
    console.log('📡 [Translation] MyMemory API üzerinden çeviri yapılıyor...');
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=tr|en`
    );
    if (response.ok) {
      const data = await response.json();
      const apiTranslation = data.responseData?.translatedText;
      if (apiTranslation && apiTranslation.trim() !== '') {
        console.log('🔄 [Translation] MyMemory API Çeviri Sonucu:', apiTranslation);
        return apiTranslation;
      }
    }
  } catch (err) {
    console.warn('⚠️ [Translation] Çeviri API hatası, yerel çeviriye dönülüyor:', err);
  }

  console.log('🔄 [Translation] Yerel kelime bazlı çeviri kullanılıyor:', localSentence);
  return localSentence;
};

export default function InspirePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchAlert, setSearchAlert] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUsingUnsplash, setIsUsingUnsplash] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async (query: string, pageNum: number, isInitial: boolean) => {
    console.log('🚀 [InspirePage] fetchImages tetiklendi:', { query, pageNum, isInitial });
    setLoading(true);
    setError('');

    const perPage = isInitial ? 20 : 12;

    try {
      if (isKeyValid) {
        setIsUsingUnsplash(true);
        // Translate query to English for Unsplash search
        const translatedQuery = query ? await translateToEnglish(query) : 'craft design furniture';
        console.log(`📡 Unsplash API üzerinden canlı arama yapılıyor... (Orijinal: "${query}", Çevrilen: "${translatedQuery}")`);

        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(translatedQuery)}&page=${pageNum}&per_page=${perPage}&client_id=${ACCESS_KEY}`
        );

        console.log('📡 Unsplash API Yanıt Durumu:', response.status);

        if (!response.ok) {
          throw new Error(`Unsplash API isteği başarısız oldu. Durum: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results.map((img: any) => ({
          id: img.id,
          url: img.urls.regular,
          author: img.user.name,
          title: img.description || img.alt_description || 'Tasarım İlhamı',
          categories: []
        }));

        console.log('📡 Alınan Unsplash Görsel Adedi:', results.length);
        setImages(prev => (isInitial ? results : [...prev, ...results]));
        setHasMore(results.length >= perPage);
      } else {
        setIsUsingUnsplash(false);
        console.log('🏠 Unsplash API Key bulunamadı veya geçersiz. Yerel hazır kütüphane kullanılıyor...');
        // Local Fallback search engine
        let filtered = FALLBACK_IMAGES;
        if (query) {
          const terms = normalizeText(query).split(/\s+/);
          console.log('🏠 Normalleştirilmiş arama terimleri:', terms);
          filtered = FALLBACK_IMAGES.filter(img =>
            terms.every(term =>
              normalizeText(img.title).includes(term) ||
              img.categories.some(cat => normalizeText(cat).includes(term)) ||
              normalizeText(img.author).includes(term)
            )
          );
        }

        console.log(`🏠 Filtrelenmiş hazır görsel adedi: ${filtered.length}`);

        // If filtering returns nothing, show popular fallback instead of empty list
        let isFallbackEmpty = filtered.length === 0;
        if (isFallbackEmpty && query) {
          filtered = FALLBACK_IMAGES; // Show all
          setSearchAlert(`"${query}" aramasıyla eşleşen hazır tasarım bulunamadı. Sizin için popüler tasarımları listeliyoruz.`);
          console.log('⚠️ Eşleşen görsel bulunamadığı için popüler tasarımlar gösteriliyor.');
        } else {
          setSearchAlert('');
        }

        const startIndex = isInitial ? 0 : 20 + (pageNum - 2) * 12;
        const limit = isInitial ? 20 : 12;
        const results = filtered.slice(startIndex, startIndex + limit);

        console.log(`🏠 Sayfa için seçilen görseller: ${results.length} adet (index: ${startIndex}-${startIndex + limit})`);
        setImages(prev => (isInitial ? results : [...prev, ...results]));
        
        // In fallback mode, check if we still have items left to load
        if (isFallbackEmpty && query) {
          setHasMore(false);
        } else {
          setHasMore(startIndex + limit < filtered.length);
        }
      }
    } catch (err: any) {
      console.error('❌ fetchImages hatası:', err);
      setError(`Görseller yüklenirken bir sorun oluştu (${err.message || err}). Hazır kütüphane yükleniyor...`);
      
      // Fallback in case of Unsplash API failure
      setIsUsingUnsplash(false);
      let filtered = FALLBACK_IMAGES;
      if (query) {
        const terms = normalizeText(query).split(/\s+/);
        filtered = FALLBACK_IMAGES.filter(img =>
          terms.every(term =>
            normalizeText(img.title).includes(term) ||
            img.categories.some(cat => cat.includes(term)) ||
            normalizeText(img.author).includes(term)
          )
        );
      }
      const results = filtered.slice(0, isInitial ? 20 : 12);
      setImages(prev => (isInitial ? results : [...prev, ...results]));
      setHasMore(results.length >= (isInitial ? 20 : 12) && results.length < filtered.length);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchImages('', 1, true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 [Form Submit] Arama tetiklendi, Sorgu:', searchQuery);
    setPage(1);
    setAppliedQuery(searchQuery);
    fetchImages(searchQuery, 1, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    console.log('➕ [Load More] Daha fazla yükleniyor, Sayfa:', nextPage);
    setPage(nextPage);
    fetchImages(appliedQuery, nextPage, false);
  };

  const handleOrderRedirect = (imgUrl: string, imgTitle: string) => {
    const encodedTitle = encodeURIComponent(`İlham Al: ${imgTitle}`);
    router.push(`/orders/new?referenceImageUrl=${encodeURIComponent(imgUrl)}&title=${encodedTitle}`);
  };

  // Determine actual empty state
  const isNoResultsFound = images.length === 0;

  return (
    <div className="min-h-screen bg-blueprint-grid py-8 px-4 sm:px-6 lg:px-8">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E60023]/10 text-[#E60023] text-sm font-semibold mb-4 border border-[#E60023]/20 animate-pulse">
          <SparklesIcon className="w-4 h-4" />
          <span>Tasarım İlham Havuzu</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#231916] tracking-tight mb-3">
          Ne Hayal Ediyorsunuz?
        </h1>
        <p className="text-base text-[#56423d] max-w-2xl mx-auto">
          Göz alıcı tasarımları inceleyin, beğendiğiniz görseli tek tıkla seçerek zanaatkârlarımıza aynısını sipariş edin.
        </p>
      </div>

      {/* ─── Search Bar ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearchSubmit} className="relative glass-panel rounded-full shadow-lg p-1.5 flex items-center border border-[#e9d6d1] focus-within:ring-2 focus-within:ring-[#de6b48] transition-all duration-200">
          <div className="flex items-center pl-4 flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-[#8a726b] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="örn. ceviz masa, modern sandalye, seramik kupa..."
              className="w-full bg-transparent border-0 outline-none pl-3 text-[#231916] placeholder-[#8a726b] text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E60023] hover:bg-[#c3001e] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Arama Yap
          </button>
        </form>
        
        {/* API Info Label */}
        <div className="text-center mt-3 text-[11px] text-[#8a726b] flex items-center justify-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isUsingUnsplash ? 'bg-green-500' : 'bg-amber-400'}`}></span>
          {isUsingUnsplash ? (
            <span>Unsplash API üzerinden canlı sonuçlar gösteriliyor.</span>
          ) : (
            <span>Hazır ilham kütüphanesi çalışıyor (Limitiz & Hızlı).</span>
          )}
        </div>
      </div>

      {/* ─── Search Warning Alert ───────────────────────────────── */}
      {searchAlert && (
        <div className="max-w-2xl mx-auto mb-8 text-center text-sm bg-amber-50 text-amber-800 border border-amber-200 px-4 py-3 rounded-xl shadow-sm animate-pulse">
          {searchAlert}
        </div>
      )}

      {/* ─── Error State ────────────────────────────────────────── */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 text-center text-xs bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* ─── Empty state (No Filter Matches) ────────────────────── */}
      {!loading && isNoResultsFound && (
        <div className="max-w-md mx-auto text-center py-12">
          <PhotoIcon className="w-16 h-16 text-[#ddc0b9] mx-auto mb-4" />
          <p className="text-[#231916] font-semibold text-lg mb-1">Aramanıza uygun sonuç bulunamadı</p>
          <p className="text-[#56423d] text-sm mb-6">Farklı kelimelerle aramayı deneyebilir veya tüm görsellere göz atabilirsiniz.</p>
          <button
            onClick={() => { setSearchQuery(''); setAppliedQuery(''); fetchImages('', 1, true); }}
            className="btn-secondary text-sm px-5 py-2.5"
          >
            Tümünü Göster
          </button>
        </div>
      )}

      {/* ─── Gallery Grid ───────────────────────────────────────── */}
      {images.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {/* Responsive 4 Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <div
                key={`${img.id}-${index}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#e9d6d1]/60 hover:border-[#de6b48]/30 hover:scale-[1.02] transition-all duration-300 flex flex-col aspect-[4/5] scroll-reveal"
              >
                {/* Visual */}
                <div className="relative w-full h-full bg-[#fcf5f3] overflow-hidden flex-1">
                  <img
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-medium tracking-wide mb-0.5">
                      Fotoğraf: {img.author}
                    </p>
                    <h3 className="text-white text-sm font-bold truncate mb-3">
                      {img.title}
                    </h3>
                    
                    <button
                      onClick={() => handleOrderRedirect(img.url, img.title)}
                      className="w-full bg-[#de6b48] hover:bg-[#c45a38] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Aynısından Sipariş Et
                    </button>
                  </div>
                </div>

                {/* Visible Info Footer (for premium feel and screen readers) */}
                <div className="p-3 border-t border-[#e9d6d1]/40 bg-white flex items-center justify-between group-hover:bg-[#fffcfc] transition-colors">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs text-[#8a726b] font-medium truncate">@{img.author}</p>
                    <h4 className="text-[13px] text-[#231916] font-semibold truncate">{img.title}</h4>
                  </div>
                  <button
                    onClick={() => handleOrderRedirect(img.url, img.title)}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fff1ed] hover:bg-[#de6b48] text-[#de6b48] hover:text-white flex items-center justify-center transition-all duration-150 cursor-pointer"
                    title="Aynısından Sipariş Et"
                  >
                    <PlusIcon className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Pagination Button ──────────────────────────────────── */}
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-secondary px-8 py-3 flex items-center gap-2.5 hover:bg-[#fff1ed] border-[#de6b48]/30 hover:border-[#de6b48] text-[#de6b48] font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <span>Daha Fazla Yükle</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
