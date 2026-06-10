import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2;

// Access key retrieved from apps/web/.env.local
const ACCESS_KEY = 'CXZuPfhx8TA8g5fVm0OI4EnwfMRLmPnvIQRt7ffUCPc' as string;
const isKeyValid = ACCESS_KEY && ACCESS_KEY !== 'undefined' && ACCESS_KEY !== 'null' && ACCESS_KEY.trim() !== '';

interface ImageItem {
  id: string;
  url: string;
  author: string;
  title: string;
  categories: string[];
}

const FALLBACK_IMAGES: ImageItem[] = [
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
  {
    id: 'f25',
    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
    author: 'Jannis Lucas',
    title: 'Metal ve Ahşap Ayaklı Sehpa',
    categories: ['metal', 'table', 'masa', 'furniture', 'mobilya']
  },
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

  // 1. Local Quick Translation Check
  if (COMMON_TRANSLATIONS[cleanQuery]) {
    return COMMON_TRANSLATIONS[cleanQuery];
  }

  // Multi-word local translate
  const words = cleanQuery.split(/\s+/);
  const localTranslatedWords = words.map(w => COMMON_TRANSLATIONS[w] || w);
  const localSentence = localTranslatedWords.join(' ');

  // 2. Free Translation API MyMemory
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=tr|en`
    );
    if (response.ok) {
      const data = await response.json();
      const apiTranslation = data.responseData?.translatedText;
      if (apiTranslation && apiTranslation.trim() !== '') {
        return apiTranslation;
      }
    }
  } catch (err) {
    console.warn('⚠️ [Translation] API translation failed, falling back to local:', err);
  }

  return localSentence;
};

export default function InspireScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchAlert, setSearchAlert] = useState('');
  const [isUsingUnsplash, setIsUsingUnsplash] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (query: string, pageNum: number, isInitial: boolean) => {
    setLoading(true);
    setError('');
    const perPage = isInitial ? 20 : 12;

    try {
      if (isKeyValid) {
        setIsUsingUnsplash(true);
        const translatedQuery = query ? await translateToEnglish(query) : 'craft design furniture';
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(translatedQuery)}&page=${pageNum}&per_page=${perPage}&client_id=${ACCESS_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Unsplash HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results.map((img: any) => ({
          id: img.id,
          url: img.urls.regular,
          author: img.user.name,
          title: img.description || img.alt_description || 'Tasarım İlhamı',
          categories: []
        }));

        setImages(prev => (isInitial ? results : [...prev, ...results]));
        setHasMore(results.length >= perPage);
      } else {
        setIsUsingUnsplash(false);
        let filtered = FALLBACK_IMAGES;

        if (query) {
          const terms = normalizeText(query).split(/\s+/);
          filtered = FALLBACK_IMAGES.filter(img =>
            terms.every(term =>
              normalizeText(img.title).includes(term) ||
              img.categories.some(cat => normalizeText(cat).includes(term)) ||
              normalizeText(img.author).includes(term)
            )
          );
        }

        let isFallbackEmpty = filtered.length === 0;
        if (isFallbackEmpty && query) {
          filtered = FALLBACK_IMAGES;
          setSearchAlert(`"${query}" aramasıyla eşleşen hazır tasarım bulunamadı. Popüler tasarımlar gösteriliyor.`);
        } else {
          setSearchAlert('');
        }

        const startIndex = isInitial ? 0 : 20 + (pageNum - 2) * 12;
        const limit = isInitial ? 20 : 12;
        const results = filtered.slice(startIndex, startIndex + limit);

        setImages(prev => (isInitial ? results : [...prev, ...results]));
        setHasMore(startIndex + limit < filtered.length);
      }
    } catch (err: any) {
      console.error(err);
      setError('Görseller yüklenirken bir sorun oluştu. Hazır kütüphane yükleniyor...');
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
  }, []);

  useEffect(() => {
    fetchImages('', 1, true);
  }, [fetchImages]);

  const handleSearchSubmit = () => {
    setPage(1);
    setAppliedQuery(searchQuery);
    fetchImages(searchQuery, 1, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(appliedQuery, nextPage, false);
  };

  const handleOrderRedirect = (item: ImageItem) => {
    navigation.navigate('OrdersTab', {
      screen: 'NewOrder',
      params: {
        referenceImageUrl: item.url,
        title: `İlham Al: ${item.title}`,
      },
    });
  };

  const renderInspireCard = ({ item }: { item: ImageItem }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.url }} style={styles.cardImage} />
        <View style={styles.imageVignette}>
          <TouchableOpacity
            style={styles.floatingOrderButton}
            onPress={() => handleOrderRedirect(item)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.floatingOrderButtonText}>Aynısından İste</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.authorName} numberOfLines={1}>
          @{item.author}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <TouchableOpacity
          style={styles.footerOrderButton}
          onPress={() => handleOrderRedirect(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={16} color={theme.colors.primary} />
          <Text style={styles.footerOrderButtonText}>Sipariş Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Ionicons name="sparkles" size={14} color="#E60023" />
          <Text style={styles.badgeText}>Tasarım İlham Havuzu</Text>
        </View>
        <Text style={styles.headerTitle}>Ne Hayal Ediyorsunuz?</Text>
        <Text style={styles.headerSubtitle}>
          Göz alıcı tasarımları arayın, beğendiğiniz görselin aynısını tek tıkla sipariş edin.
        </Text>
      </View>

      {/* Pinterest-like Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="örn. ceviz masa, modern sandalye..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </View>

        {/* API Connection Indicator */}
        <View style={styles.indicatorRow}>
          <View style={[styles.indicatorDot, isUsingUnsplash ? styles.indicatorOnline : styles.indicatorOffline]} />
          <Text style={styles.indicatorText}>
            {isUsingUnsplash ? 'Unsplash API üzerinden canlı sonuçlar gösteriliyor.' : 'Hazır ilham kütüphanesi aktif.'}
          </Text>
        </View>
      </View>

      {/* Search Alert */}
      {searchAlert ? (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>{searchAlert}</Text>
        </View>
      ) : null}

      {/* Main Grid List */}
      {loading && images.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, idx) => item.id + idx}
          renderItem={renderInspireCard}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={40} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Aradığınız kriterlere uygun ilham görseli bulunamadı.</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && images.length > 0 ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.loadMoreButtonText}>Daha Fazla Yükle</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: '#fff',
    alignItems: 'center',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(230, 0, 35, 0.08)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 0, 35, 0.15)',
  },
  badgeText: {
    color: '#E60023',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  searchHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f6',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    height: 48,
    paddingLeft: theme.spacing.md,
    paddingRight: 4,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.sm,
    height: '100%',
  },
  searchButton: {
    backgroundColor: '#E60023',
    height: 40,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorOnline: {
    backgroundColor: '#22c55e',
  },
  indicatorOffline: {
    backgroundColor: '#fbbf24',
  },
  indicatorText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  alertContainer: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  alertText: {
    fontSize: 11,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#fcf5f3',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageVignette: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
    padding: theme.spacing.sm,
  },
  floatingOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(222, 107, 72, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
    gap: 2,
  },
  floatingOrderButtonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardDetails: {
    padding: theme.spacing.sm,
    gap: 2,
  },
  authorName: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  footerOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  footerOrderButtonText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#e9d6d1',
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  loadMoreButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
