import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi, returnsApi, Order, Return } from '../../services/api';
import { theme } from '../../theme/theme';
import { SideMenuContext } from './ArtisanTabNavigator';

const ORDER_STATUS = {
  IN_PROGRESS: { label: 'Devam Ediyor', icon: 'time-outline' as const, color: '#d97706', bg: '#fffbeb' },
  DELIVERED: { label: 'Teslim Edildi', icon: 'checkmark-circle-outline' as const, color: '#2563eb', bg: '#eff6ff' },
  COMPLETED: { label: 'Tamamlandı', icon: 'checkmark-circle' as const, color: '#16a34a', bg: '#f0fdf4' },
};

const RETURN_STATUS = {
  REQUESTED: { label: 'İade Talep Edildi', color: '#d97706', bg: '#fffbeb' },
  APPROVED: { label: 'İade Onaylandı', color: '#16a34a', bg: '#f0fdf4' },
  REJECTED: { label: 'İade Reddedildi', color: '#dc2626', bg: '#fef2f2' },
  REFUNDED: { label: 'İade Edildi', color: '#dc2626', bg: '#fef2f2' },
};

export default function ArtisanWorkspaceScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingReturns, setPendingReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState<string | null>(null);
  const { toggleMenu } = useContext(SideMenuContext);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        ordersApi.getMyOrders(),
        returnsApi.getMyReturns(),
      ]);
      const allOrders: Order[] = ordersRes.data || [];
      const activeOrders = allOrders.filter(
        (o) => o.status === 'IN_PROGRESS' || o.status === 'DELIVERED' || o.status === 'COMPLETED'
      );
      setOrders(activeOrders);
      const returns: Return[] = returnsRes.data || [];
      setPendingReturns(returns.filter((r) => r.status === 'REQUESTED'));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleApproveReturn = async (returnId: string) => {
    setIsProcessingReturn(returnId);
    try {
      await returnsApi.approveReturn(returnId);
      Alert.alert('Başarılı', 'İade talebi onaylandı.');
      fetchData();
    } catch {
      Alert.alert('Hata', 'İade onaylanamadı.');
    } finally {
      setIsProcessingReturn(null);
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    setIsProcessingReturn(returnId);
    try {
      await returnsApi.rejectReturn(returnId);
      Alert.alert('Başarılı', 'İade talebi reddedildi.');
      fetchData();
    } catch {
      Alert.alert('Hata', 'İade reddedilemedi.');
    } finally {
      setIsProcessingReturn(null);
    }
  };

  const renderReturnCard = (ret: Return) => (
    <View key={ret.id} style={styles.returnCard}>
      <View style={styles.returnHeader}>
        <Ionicons name="arrow-undo" size={20} color="#d97706" />
        <Text style={styles.returnTitle}>Bekleyen İade Talebi</Text>
      </View>
      <Text style={styles.returnOrderTitle}>{ret.orderTitle}</Text>
      <Text style={styles.returnCustomer}>{ret.customerName} tarafından talep edildi</Text>
      <Text style={styles.returnReason}>"{ret.reason}"</Text>
      <Text style={styles.returnAmount}>İade Tutarı: ₺{ret.amount.toLocaleString('tr-TR')}</Text>
      <View style={styles.returnActions}>
        <TouchableOpacity
          style={styles.rejectReturnBtn}
          onPress={() => handleRejectReturn(ret.id)}
          disabled={isProcessingReturn === ret.id}
        >
          {isProcessingReturn === ret.id ? (
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          ) : (
            <>
              <Ionicons name="close-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.rejectReturnText}>Reddet</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveReturnBtn}
          onPress={() => handleApproveReturn(ret.id)}
          disabled={isProcessingReturn === ret.id}
        >
          {isProcessingReturn === ret.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.approveReturnText}>İadeyi Onayla</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderCard = ({ item }: { item: Order }) => {
    const status = ORDER_STATUS[item.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.IN_PROGRESS;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, role: 'ARTISAN' })}
      >
        <View style={styles.orderCardTop}>
          <View style={[styles.orderStatusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.orderStatusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.orderPrice}>
            {item.agreedPrice ? `₺${item.agreedPrice.toLocaleString('tr-TR')}` : ''}
          </Text>
        </View>
        <Text style={styles.orderTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.orderMeta}>
          <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.orderMetaText}>{item.customerName || 'Müşteri'}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.viewOrderText}>Siparişi Gör</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Atölyem</Text>
            <Text style={styles.headerSub}>Kabul edilen siparişlerinizi yönetin</Text>
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
          <Text style={styles.headerTitle}>Atölyem</Text>
          <Text style={styles.headerSub}>Kabul edilen siparişlerinizi yönetin</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          pendingReturns.length > 0 ? (
            <View style={styles.returnsSection}>
              <View style={styles.returnsSectionHeader}>
                <Ionicons name="arrow-undo" size={18} color="#d97706" />
                <Text style={styles.returnsSectionTitle}>
                  Bekleyen İade Talepleri ({pendingReturns.length})
                </Text>
              </View>
              {pendingReturns.map(renderReturnCard)}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aktif iş yok</Text>
            <Text style={styles.emptyDesc}>Henüz üzerinde çalıştığınız bir sipariş bulunmuyor.</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => navigation.navigate('FeedTab')}
            >
              <Text style={styles.emptyCtaText}>İş Fırsatlarına Git</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      />
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
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  returnsSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  returnsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  returnsSectionTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#d97706',
  },
  returnCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  returnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  returnTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#92400e',
  },
  returnOrderTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  returnCustomer: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  returnReason: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  returnAmount: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  returnActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  rejectReturnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
  },
  rejectReturnText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  approveReturnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
  },
  approveReturnText: {
    fontSize: theme.typography.fontSizes.sm,
    color: '#fff',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
  orderPrice: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  orderTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderMetaText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    flex: 1,
  },
  orderDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewOrderText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.md,
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
  emptyCta: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyCtaText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});
