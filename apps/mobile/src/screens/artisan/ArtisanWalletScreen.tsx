import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi, Payment } from '../../services/api';
import { theme } from '../../theme/theme';

const STATUS_MAP: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  HELD_IN_ESCROW: { label: 'Havuzda Bekliyor', icon: 'shield-checkmark-outline', color: '#d97706', bg: '#fffbeb' },
  RELEASED_TO_ARTISAN: { label: 'Zanaatkara Aktarıldı', icon: 'checkmark-circle', color: '#16a34a', bg: '#f0fdf4' },
  REFUNDED: { label: 'İade Edildi', icon: 'arrow-undo', color: '#dc2626', bg: '#fef2f2' },
};

export default function ArtisanWalletScreen({ navigation }: any) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await paymentsApi.getMyPayments();
      setPayments(res.data || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPayments);
    return unsubscribe;
  }, [navigation, fetchPayments]);

  const totalHeld = payments.filter((p) => p.status === 'HELD_IN_ESCROW').reduce((s, p) => s + p.amount, 0);
  const totalReleased = payments.filter((p) => p.status === 'RELEASED_TO_ARTISAN').reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === 'REFUNDED').reduce((s, p) => s + p.amount, 0);

  const renderPayment = ({ item }: { item: Payment }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.HELD_IN_ESCROW;
    return (
      <TouchableOpacity
        style={styles.paymentRow}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId, role: 'ARTISAN' })}
      >
        <View style={[styles.paymentIcon, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon} size={18} color={s.color} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentStatus}>{s.label}</Text>
          <Text style={styles.paymentDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <Text style={[styles.paymentAmount, { color: s.color }]}>
          ₺{item.amount.toLocaleString('tr-TR')}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cüzdan</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cüzdan</Text>
      </View>

      {payments.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#d97706" />
            <Text style={styles.summaryLabel}>Havuzda Bekliyor</Text>
            <Text style={[styles.summaryValue, { color: '#d97706' }]}>₺{totalHeld.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.summaryLabel}>Kazanılan Toplam</Text>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>₺{totalReleased.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-undo" size={20} color="#dc2626" />
            <Text style={styles.summaryLabel}>İade Edilen</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>₺{totalRefunded.toLocaleString('tr-TR')}</Text>
          </View>
        </View>
      )}

      {payments.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="wallet-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Henüz ödeme yok</Text>
          <Text style={styles.emptyDesc}>Kabul edilen tekliflerinizin ödemeleri burada görünecek.</Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('FeedTab')}>
            <Text style={styles.emptyCtaText}>İş Fırsatlarına Git</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderPayment}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.historyTitle}>İşlem Geçmişi</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchPayments} tintColor={theme.colors.primary} />
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
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  historyTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentStatus: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  paymentDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
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
