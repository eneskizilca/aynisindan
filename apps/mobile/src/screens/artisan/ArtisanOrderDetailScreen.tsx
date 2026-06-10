import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi, quotesApi, paymentsApi, reviewsApi, returnsApi, Order, Quote, Review } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

const ORDER_STATUS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  PENDING: { label: 'Teklif Bekliyor', icon: 'time-outline', color: '#d97706', bg: '#fffbeb' },
  IN_PROGRESS: { label: 'Devam Ediyor', icon: 'construct-outline', color: '#d97706', bg: '#fffbeb' },
  DELIVERED: { label: 'Teslim Edildi', icon: 'checkmark-circle-outline', color: '#2563eb', bg: '#eff6ff' },
  COMPLETED: { label: 'Tamamlandı', icon: 'checkmark-circle', color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED: { label: 'İptal Edildi', icon: 'close-circle', color: '#dc2626', bg: '#fef2f2' },
};

export default function ArtisanOrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params || {};
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDays, setQuoteDays] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orderId) return;
    try {
      const [orderRes, quotesRes] = await Promise.all([
        ordersApi.getOrderById(orderId),
        quotesApi.getQuotesByOrder(orderId),
      ]);
      setOrder(orderRes.data);
      setQuotes(quotesRes.data || []);
      try {
        const payRes = await paymentsApi.getPaymentsByOrder(orderId);
        setPayments(payRes.data || []);
      } catch { /* no payment */ }
      try {
        const revRes = await reviewsApi.getReviewByOrder(orderId);
        setExistingReview(revRes.data || null);
      } catch { /* no review */ }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sipariş yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitQuote = async () => {
    if (!quotePrice || !quoteDays) {
      Alert.alert('Uyarı', 'Fiyat ve teslimat günü zorunludur.');
      return;
    }
    setIsSubmittingQuote(true);
    try {
      await quotesApi.createQuote({
        orderId,
        offeredPrice: parseFloat(quotePrice),
        estimatedDays: parseInt(quoteDays, 10),
        message: quoteMessage.trim() || undefined,
      });
      setQuoteSubmitted(true);
      fetchData();
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'Teklif gönderilemedi.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCompleteOrder = async () => {
    Alert.alert('Teslimat', 'Siparişi teslim etmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Kargoya Verdim',
        onPress: async () => {
          setIsCompleting(true);
          try {
            await ordersApi.completeOrder(orderId);
            Alert.alert('Başarılı', 'Sipariş teslim edildi olarak işaretlendi.');
            fetchData();
          } catch {
            Alert.alert('Hata', 'Sipariş tamamlanamadı.');
          } finally {
            setIsCompleting(false);
          }
        },
      },
    ]);
  };

  const isPaymentHeld = payments.some((p) => p.status === 'HELD_IN_ESCROW' || p.status === 'RELEASED_TO_ARTISAN');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sipariş Detayı</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sipariş Detayı</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Sipariş bulunamadı.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Detayı</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        {order.referenceImageUrl ? (
          <Image source={{ uri: order.referenceImageUrl }} style={styles.orderImage} />
        ) : null}

        <View style={styles.section}>
          <Text style={styles.orderTitle}>{order.title}</Text>
          <Text style={styles.orderDesc}>{order.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{order.customerName || 'Müşteri'}</Text>
          </View>
          {order.agreedPrice ? (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>Anlaşılan Fiyat: ₺{order.agreedPrice.toLocaleString('tr-TR')}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
        </View>

        {isPaymentHeld && (
          <View style={[styles.infoCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#d97706" />
            <Text style={[styles.infoCardText, { color: '#92400e' }]}>Param-Güvende Aktif</Text>
          </View>
        )}

        {existingReview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Müşteri Değerlendirmesi</Text>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= existingReview.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#f59e0b"
                />
              ))}
              <Text style={styles.reviewRating}>{existingReview.rating}/5</Text>
            </View>
            {existingReview.comment ? (
              <Text style={styles.reviewComment}>"{existingReview.comment}"</Text>
            ) : null}
          </View>
        )}

        <View style={styles.chatCard}>
          <View style={styles.chatCardLeft}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
            <View>
              <Text style={styles.chatCardTitle}>Müşteri ile Sohbet</Text>
              <Text style={styles.chatCardSub}>Mesaj gönderin</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.chatCardBtn}
            onPress={() => navigation.navigate('ChatDetail', {
              otherUserId: order.customerId,
              otherUserName: order.customerName || 'Müşteri',
              orderId: order.id,
            })}
          >
            <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {order.status === 'PENDING' && !quoteSubmitted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teklif Ver</Text>
            <TextInput
              style={styles.input}
              placeholder="Teklif Fiyatı (₺)"
              placeholderTextColor={theme.colors.textSecondary}
              value={quotePrice}
              onChangeText={setQuotePrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Teslimat Günü"
              placeholderTextColor={theme.colors.textSecondary}
              value={quoteDays}
              onChangeText={setQuoteDays}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.textArea}
              placeholder="Mesaj (İsteğe Bağlı)"
              placeholderTextColor={theme.colors.textSecondary}
              value={quoteMessage}
              onChangeText={setQuoteMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmittingQuote && { opacity: 0.7 }]}
              onPress={handleSubmitQuote}
              disabled={isSubmittingQuote}
            >
              {isSubmittingQuote ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Teklif Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'PENDING' && quoteSubmitted && (
          <View style={[styles.infoCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <Text style={[styles.infoCardText, { color: '#166534' }]}>Teklif başarıyla gönderildi!</Text>
          </View>
        )}

        {order.status === 'IN_PROGRESS' && isPaymentHeld && (
          <TouchableOpacity
            style={[styles.primaryBtn, styles.deliverBtn, isCompleting && { opacity: 0.7 }]}
            onPress={handleCompleteOrder}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Kargoya Verdim</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusBannerText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
  orderImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    resizeMode: 'cover',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  orderTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  orderDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  infoCardText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewRating: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  chatCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  chatCardTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  chatCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  chatCardBtn: {
    padding: theme.spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 80,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  deliverBtn: {
    marginTop: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
  },
});
