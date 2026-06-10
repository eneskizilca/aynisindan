import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi, Order } from '../../services/api';
import { theme } from '../../theme/theme';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'TEKLİF BEKLENİYOR',
  IN_PROGRESS: 'DEVAM EDİYOR',
  DELIVERED: 'TESLİM EDİLDİ',
  COMPLETED: 'TAMAMLANDI',
  CANCELLED: 'İPTAL EDİLDİ',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706' }, // amber
  IN_PROGRESS: { bg: '#e0f2fe', text: '#0284c7' }, // sky blue
  DELIVERED: { bg: '#e0e7ff', text: '#4f46e5' }, // indigo
  COMPLETED: { bg: '#dcfce7', text: '#16a34a' }, // green
  CANCELLED: { bg: '#f3f4f6', text: '#4b5563' }, // grey
};

export default function CustomerOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsLoading(true);
    setError('');
    try {
      const res = await ordersApi.getMyOrders();
      setOrders(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Siparişler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Refresh on screen focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders(true);
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  const getEscrowBadge = (status: string) => {
    if (status === 'IN_PROGRESS' || status === 'DELIVERED') {
      return (
        <View style={styles.escrowBadge}>
          <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
          <Text style={[styles.escrowBadgeText, { color: theme.colors.primary }]}>
            Ödeme Param-Güvende&apos;de korumada
          </Text>
        </View>
      );
    }
    if (status === 'PENDING') {
      return (
        <View style={styles.escrowBadge}>
          <Ionicons name="time-outline" size={14} color="#d97706" />
          <Text style={[styles.escrowBadgeText, { color: '#d97706' }]}>
            Teklif & ödeme bekleniyor
          </Text>
        </View>
      );
    }
    if (status === 'COMPLETED') {
      return (
        <View style={styles.escrowBadge}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#16a34a" />
          <Text style={[styles.escrowBadgeText, { color: '#16a34a' }]}>
            Ödeme zanaatkâra aktarıldı
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLORS[item.status] || { bg: '#fff', text: '#000' };
    const actionLabel = item.status === 'PENDING' ? 'Teklifleri İncele →' : 'Detayları Gör →';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.imageWrapper}>
            {item.referenceImageUrl ? (
              <Image source={{ uri: item.referenceImageUrl }} style={styles.orderImage} />
            ) : (
              <View style={styles.noImageBadge}>
                <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.noImageText}>Görsel Yok</Text>
              </View>
            )}
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.titleRow}>
              <Text style={styles.orderTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {STATUS_LABELS[item.status] || item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDesc} numberOfLines={2}>
              {item.description}
            </Text>
            {item.artisanName && (
              <Text style={styles.artisanName}>Zanaatkâr: {item.artisanName}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          {getEscrowBadge(item.status)}
          <Text style={styles.actionLink}>{actionLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Siparişlerim</Text>
          <Text style={styles.headerSubtitle}>
            Mevcut projelerinizi yönetin ve durumlarını takip edin.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders(true)}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="basket-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Henüz siparişiniz yok</Text>
          <Text style={styles.emptyText}>İlk özel sipariş talebinizi hemen oluşturun.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('NewOrder')}
          >
            <Text style={styles.emptyButtonText}>Yeni Sipariş Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
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

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewOrder')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
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
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.errorBg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 100, // Extra padding for FAB
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageBadge: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  noImageText: {
    fontSize: 9,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  orderTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
  },
  statusText: {
    fontSize: 9,
    fontWeight: theme.typography.fontWeights.bold,
  },
  orderDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  artisanName: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
    marginTop: theme.spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  escrowBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.medium,
  },
  actionLink: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
