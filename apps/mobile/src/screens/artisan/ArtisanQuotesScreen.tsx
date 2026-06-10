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
import { quotesApi, Quote } from '../../services/api';
import { theme } from '../../theme/theme';
const STATUS_MAP: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  PENDING: { label: 'Beklemede', icon: 'time-outline', color: '#d97706', bg: '#fffbeb' },
  ACCEPTED: { label: 'Kabul Edildi', icon: 'checkmark-circle', color: '#16a34a', bg: '#f0fdf4' },
  REJECTED: { label: 'Reddedildi', icon: 'close-circle', color: '#dc2626', bg: '#fef2f2' },
};

export default function ArtisanQuotesScreen({ navigation }: any) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchQuotes = useCallback(async () => {
    try {
      setError('');
      const res = await quotesApi.getMyQuotes();
      setQuotes(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Teklifler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchQuotes);
    return unsubscribe;
  }, [navigation, fetchQuotes]);

  const renderQuote = ({ item }: { item: Quote }) => {
    const status = STATUS_MAP[item.status] || STATUS_MAP.PENDING;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId, role: 'ARTISAN' })}
      >
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.price}>₺{item.offeredPrice.toLocaleString('tr-TR')}</Text>
        </View>

        <Text style={styles.orderTitle} numberOfLines={1}>{item.orderTitle || 'Sipariş'}</Text>

        {item.message ? (
          <Text style={styles.message} numberOfLines={2}>"{item.message}"</Text>
        ) : null}

        <View style={styles.cardBottom}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.deliveryText}>{item.estimatedDays} Günde Teslimat</Text>
          </View>
          <View style={styles.viewOrder}>
            <Text style={styles.viewOrderText}>Siparişi Gör</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
          </View>
        </View>
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
          <Text style={styles.headerTitle}>Tekliflerim</Text>
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
        <Text style={styles.headerTitle}>Tekliflerim</Text>
      </View>

      {error ? (
        <View style={styles.centerContent}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      ) : quotes.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Henüz teklif vermediniz</Text>
          <Text style={styles.emptyDesc}>Gönderdiğiniz teklifler burada görünecek.</Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => navigation.navigate('FeedTab')}
          >
            <Text style={styles.emptyCtaText}>İş Fırsatlarına Git</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuote}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchQuotes} tintColor={theme.colors.primary} />
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
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  statusText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
  },
  price: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  orderTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  message: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  viewOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewOrderText: {
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
