import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi, Order } from '../../services/api';
import { theme } from '../../theme/theme';
import { SideMenuContext } from './ArtisanTabNavigator';

const STATUS_BADGE = {
  PENDING: { label: 'Teklif Bekliyor', color: '#d97706', bg: '#fffbeb' },
};

export default function ArtisanFeedScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { toggleMenu } = useContext(SideMenuContext);

  const fetchOrders = useCallback(async () => {
    try {
      setError('');
      const res = await ordersApi.getAllPendingOrders();
      setOrders(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Siparişler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, role: 'ARTISAN' })}
    >
      <View style={styles.cardImageContainer}>
        {item.referenceImageUrl ? (
          <Image source={{ uri: item.referenceImageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_BADGE.PENDING.bg }]}>
          <Ionicons name="time-outline" size={12} color={STATUS_BADGE.PENDING.color} />
          <Text style={[styles.statusBadgeText, { color: STATUS_BADGE.PENDING.color }]}>
            {STATUS_BADGE.PENDING.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.customerInfo}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={12} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customerName || 'Müşteri'}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>Teklif Ver</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>İş Fırsatları</Text>
            <Text style={styles.headerSub}>Teklif verebileceğiniz açık siparişler</Text>
          </View>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>İş Fırsatları</Text>
          <Text style={styles.headerSub}>Teklif verebileceğiniz açık siparişler</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.centerContent}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="briefcase-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Şu an açık sipariş yok</Text>
          <Text style={styles.emptyDesc}>Yeni siparişler eklendiğinde burada görünecek.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  menuButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  headerSub: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  statusBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
  cardBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  cardDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ctaText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  errorBox: {
    backgroundColor: theme.colors.errorBg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  emptyDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
