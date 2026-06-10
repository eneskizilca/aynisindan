import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { catalogApi, CatalogFeedItem } from '../../services/api';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2;

export default function ExploreScreen({ navigation }: any) {
  const [feed, setFeed] = useState<CatalogFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchFeed = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError('');
    try {
      const res = await catalogApi.getFeed();
      setFeed(res.data || []);
    } catch (err: any) {
      setError('Eserler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed(false);
  };

  const handleOrderRedirect = (item: CatalogFeedItem) => {
    navigation.navigate('OrdersTab', {
      screen: 'NewOrder',
      params: {
        referenceImageUrl: item.image_url,
        title: `Aynısından: ${item.title}`,
      },
    });
  };

  const renderFeedItem = ({ item }: { item: CatalogFeedItem }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
            <Text style={styles.noImageText}>Görsel Yok</Text>
          </View>
        )}
        {item.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.artisanName} numberOfLines={1}>
          {item.artisan_name}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.price > 0 && (
          <Text style={styles.cardPrice}>₺{item.price.toLocaleString('tr-TR')}</Text>
        )}
        <Text style={styles.completedAt}>
          Tamamlanma: {new Date(item.completed_at).toLocaleDateString('tr-TR')}
        </Text>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => handleOrderRedirect(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.orderButtonText}>Aynısından İste</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <Text style={styles.headerSubtitle}>
          Tamamlanan eşsiz eserlere göz atın ve aynısından sipariş verin.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchFeed(true)}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : feed.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Henüz eser bulunmuyor</Text>
          <Text style={styles.emptyDesc}>Tamamlanan zanaatkâr işleri burada görüntülenecektir.</Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
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
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginTop: theme.spacing.md,
  },
  emptyDesc: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 24,
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
    height: 150,
    backgroundColor: '#fff8f6',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  noImageText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
    gap: 2,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  cardDetails: {
    padding: theme.spacing.md,
    gap: 2,
  },
  artisanName: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  cardPrice: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginTop: 2,
  },
  completedAt: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
