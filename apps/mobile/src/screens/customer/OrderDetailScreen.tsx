import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ordersApi,
  quotesApi,
  paymentsApi,
  reviewsApi,
  returnsApi,
  Order,
  Quote,
  Payment,
  Review,
  Return,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'TEKLİF BEKLENİYOR',
  IN_PROGRESS: 'DEVAM EDİYOR',
  DELIVERED: 'TESLİM EDİLDİ',
  COMPLETED: 'TAMAMLANDI',
  CANCELLED: 'İPTAL EDİLDİ',
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [existingReturn, setExistingReturn] = useState<Return | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [orderRes, quotesRes, paymentsRes] = await Promise.all([
        ordersApi.getOrderById(id),
        quotesApi.getQuotesByOrder(id),
        paymentsApi.getPaymentsByOrder(id),
      ]);
      setOrder(orderRes.data);
      setQuotes(quotesRes.data);
      setPayments(paymentsRes.data);

      try {
        const reviewRes = await reviewsApi.getReviewByOrder(id);
        setExistingReview(reviewRes.data);
      } catch {
        setExistingReview(null);
      }

      try {
        const returnRes = await returnsApi.getReturnByOrder(id);
        setExistingReturn(returnRes.data);
      } catch {
        setExistingReturn(null);
      }
    } catch (err: any) {
      setError('Sipariş detayları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptQuote = async (quoteId: string) => {
    setIsAccepting(quoteId);
    try {
      await quotesApi.acceptQuote(quoteId);
      await fetchData();
      setShowPaymentModal(true);
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'Teklif kabul edilemedi.');
    } finally {
      setIsAccepting(null);
    }
  };

  const handleHoldPayment = async () => {
    if (cardNumber.length < 16 || cardExpiry.length < 4 || cardCvv.length < 3) {
      Alert.alert('Hata', 'Lütfen kart bilgilerini eksiksiz doldurun.');
      return;
    }

    setIsPaying(true);
    try {
      await paymentsApi.holdFunds(id);
      setShowPaymentModal(false);
      // reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      await fetchData();
      Alert.alert('Başarılı', 'Ödemeniz Param-Güvende escrow hesabına aktarıldı. Zanaatkâr üretime başladı.');
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'Ödeme gerçekleştirilemedi.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleApproveDelivery = async () => {
    Alert.alert(
      'Teslimatı Onayla',
      'Ürünü teslim aldığınızı ve ödemenin zanaatkâra aktarılmasını onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Onayla',
          onPress: async () => {
            setIsApproving(true);
            try {
              await ordersApi.approveOrder(id);
              await fetchData();
              setShowSuccessOverlay(true);
              setTimeout(() => setShowSuccessOverlay(false), 3000);
            } catch (err: any) {
              Alert.alert('Hata', err?.response?.data?.message || 'Teslim onaylanamadı.');
            } finally {
              setIsApproving(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateReturn = async () => {
    if (!returnReason.trim()) {
      Alert.alert('Hata', 'Lütfen iade gerekçesini yazın.');
      return;
    }

    setIsReturning(true);
    try {
      await returnsApi.createReturn(id, returnReason.trim());
      setShowReturnModal(false);
      setReturnReason('');
      await fetchData();
      Alert.alert('Başarılı', 'İade talebiniz zanaatkâra iletildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'İade talebi oluşturulamadı.');
    } finally {
      setIsReturning(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen yıldız seçimi yapın.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await reviewsApi.createReview(id, { rating, comment: comment.trim() });
      setExistingReview(res.data);
      setRating(0);
      setComment('');
      await fetchData();
      Alert.alert('Teşekkürler', 'Değerlendirmeniz başarıyla gönderildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.message || 'Değerlendirme gönderilemedi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isPaymentHeld = payments.some(
    (p) => p.status === 'HELD_IN_ESCROW' || p.status === 'RELEASED_TO_ARTISAN'
  );

  const getChatTarget = () => {
    const acceptedQuote = quotes.find((q) => q.status === 'ACCEPTED');
    if (acceptedQuote) {
      return {
        id: acceptedQuote.artisanId,
        name: order?.artisanName || acceptedQuote.artisanName,
      };
    }
    return null;
  };

  const chatTarget = getChatTarget();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Sipariş bulunamadı.</Text>
        <TouchableOpacity style={styles.backButtonOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Sipariş Detayı
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Images section */}
        <View style={styles.imageContainer}>
          {order.referenceImageUrl ? (
            <Image source={{ uri: order.referenceImageUrl }} style={styles.mainImage} />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.noImageText}>Referans görsel bulunmuyor</Text>
            </View>
          )}
          {order.aiGeneratedImageUrl && (
            <View style={styles.aiImageContainer}>
              <Text style={styles.aiLabel}>Yapay Zeka ile Geliştirilmiş Görsel</Text>
              <Image source={{ uri: order.aiGeneratedImageUrl }} style={styles.aiImage} />
            </View>
          )}
        </View>

        {/* Info Area */}
        <View style={styles.infoCard}>
          <View style={styles.statusRow}>
            {existingReturn?.status === 'REFUNDED' ? (
              <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.statusBadgeText, { color: '#dc2626' }]}>İADE EDİLDİ</Text>
              </View>
            ) : existingReturn?.status === 'REJECTED' ? (
              <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.statusBadgeText, { color: '#b91c1c' }]}>İADE REDDEDİLDİ</Text>
              </View>
            ) : (
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {STATUS_LABELS[order.status] || order.status}
                </Text>
              </View>
            )}
            <Text style={styles.orderId}>Sipariş #{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>

          <Text style={styles.orderTitle}>{order.title}</Text>
          <Text style={styles.orderDescription}>{order.description}</Text>

          {/* Metadata Row */}
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Oluşturulma Tarihi</Text>
              <Text style={styles.metadataValue}>
                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            {order.agreedPrice != null && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Anlaşılan Tutar</Text>
                <Text style={[styles.metadataValue, styles.priceText]}>
                  ₺{order.agreedPrice.toLocaleString('tr-TR')}
                </Text>
              </View>
            )}
            {order.artisanName && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Zanaatkâr</Text>
                <Text style={styles.metadataValue}>{order.artisanName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Escrow Banner */}
        {(order.status === 'IN_PROGRESS' || order.status === 'DELIVERED') && (
          <View style={styles.escrowCard}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.escrowTitle}>Param-Güvende Aktif</Text>
              <Text style={styles.escrowDesc}>
                Ödemeniz, siz ürünü teslim alıp onaylayana kadar Param-Güvende havuz hesabında güvendedir.
              </Text>
            </View>
          </View>
        )}

        {/* Completed escrow banner */}
        {order.status === 'COMPLETED' && (
          <View style={[styles.escrowCard, styles.successEscrowCard]}>
            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.escrowTitle, { color: '#16a34a' }]}>Ticaret Tamamlandı</Text>
              <Text style={styles.escrowDesc}>
                Güvenli ticaret başarıyla sonlandı. ₺{order.agreedPrice?.toLocaleString('tr-TR')} zanaatkâra aktarıldı.
              </Text>
            </View>
          </View>
        )}

        {/* ─── Sohbet Kartı ─── */}
        {chatTarget && (
          <View style={styles.chatCard}>
            <View style={styles.chatInfo}>
              <View style={styles.chatIconWrapper}>
                <Ionicons name="chatbubbles" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.chatTitle}>Sohbet ve İletişim</Text>
                <Text style={styles.chatSub}>Zanaatkâr: {chatTarget.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => {
                if (chatTarget) {
                  navigation.navigate('ChatDetail', {
                    otherUserId: chatTarget.id,
                    otherUserName: chatTarget.name,
                    orderId: order?.id,
                  });
                }
              }}
            >
              <Text style={styles.chatButtonText}>Mesaj Gönder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Teklifler Bölümü (PENDING) ─── */}
        {order.status === 'PENDING' && (
          <View style={styles.quotesSection}>
            <Text style={styles.sectionTitle}>{quotes.length} Teklif Alındı</Text>
            {quotes.length === 0 ? (
              <View style={styles.emptyQuotesCard}>
                <Text style={styles.emptyQuotesText}>
                  Henüz teklif yok. Zanaatkârlar kısa süre içinde tekliflerini gönderecektir.
                </Text>
              </View>
            ) : (
              quotes.map((quote, idx) => (
                <View key={quote.id} style={styles.quoteCard}>
                  {idx === 0 && (
                    <View style={styles.bestMatchBadge}>
                      <Ionicons name="star" size={10} color="#fff" />
                      <Text style={styles.bestMatchText}>En İyi Eşleşme</Text>
                    </View>
                  )}
                  <View style={styles.quoteHeader}>
                    <Text style={styles.artisanTitle}>{quote.artisanName}</Text>
                    <Text style={styles.quotePrice}>₺{quote.offeredPrice.toLocaleString('tr-TR')}</Text>
                  </View>
                  <Text style={styles.quoteDays}>Tahmini Teslimat: {quote.estimatedDays} gün</Text>
                  {quote.message ? <Text style={styles.quoteMsg}>&ldquo;{quote.message}&rdquo;</Text> : null}

                  <TouchableOpacity
                    style={[styles.acceptQuoteButton, isAccepting === quote.id && styles.disabledButton]}
                    onPress={() => handleAcceptQuote(quote.id)}
                    disabled={isAccepting != null}
                  >
                    {isAccepting === quote.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.acceptQuoteButtonText}>Teklifi Kabul Et</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── Ödeme Çağrısı (IN_PROGRESS, ödeme yapılmamış) ─── */}
        {order.status === 'IN_PROGRESS' && !isPaymentHeld && (
          <View style={styles.payContainer}>
            <View style={styles.payHeader}>
              <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.payTitle}>Param-Güvende Ödemesi Bekleniyor</Text>
            </View>
            <Text style={styles.payDesc}>
              Zanaatkâr siparişi kabul etti ve üretime başlamak için hazır. Lütfen ödemeyi yapın.
            </Text>
            <TouchableOpacity style={styles.payButton} onPress={() => setShowPaymentModal(true)}>
              <Ionicons name="shield-checkmark" size={18} color="#fff" />
              <Text style={styles.payButtonText}>
                Param-Güvende Havuzuna Yatır — ₺{order.agreedPrice?.toLocaleString('tr-TR')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Ödeme Başarılı ve Üretimde (IN_PROGRESS, ödeme yapılmış) ─── */}
        {order.status === 'IN_PROGRESS' && isPaymentHeld && (
          <View style={styles.statusSuccessCard}>
            <Ionicons name="hammer-outline" size={28} color="#16a34a" />
            <Text style={styles.statusSuccessTitle}>Üretim Aşamasında</Text>
            <Text style={styles.statusSuccessDesc}>
              Ödemeniz güvende. Zanaatkârınız siparişinizi üretmeye başladı. Detaylar için sohbetten görüşebilirsiniz.
            </Text>
          </View>
        )}

        {/* ─── Teslimat Onayı (DELIVERED, iade talebi yoksa) ─── */}
        {order.status === 'DELIVERED' && !existingReturn && (
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Ionicons name="gift-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.deliveryTitle}>Ürününüz Ulaştı!</Text>
            </View>
            <Text style={styles.deliveryDesc}>
              Zanaatkâr ürünü gönderdi. Ürünü teslim aldıysanız ödemeyi serbest bırakın. Eğer bir sorun varsa iade başlatabilirsiniz.
            </Text>
            <View style={styles.deliveryActionRow}>
              <TouchableOpacity
                style={[styles.deliveryRejectButton, isApproving && styles.disabledButton]}
                onPress={() => setShowReturnModal(true)}
                disabled={isApproving}
              >
                <Ionicons name="arrow-undo-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.deliveryRejectText}>İade Başlat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deliveryAcceptButton, isApproving && styles.disabledButton]}
                onPress={handleApproveDelivery}
                disabled={isApproving}
              >
                {isApproving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.deliveryAcceptText}>Teslim Aldım</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── İade Talebi Bekliyor (DELIVERED, iade talebi var) ─── */}
        {order.status === 'DELIVERED' && existingReturn?.status === 'REQUESTED' && (
          <View style={styles.returnAlertCard}>
            <View style={styles.returnAlertHeader}>
              <Ionicons name="time" size={20} color="#d97706" />
              <Text style={styles.returnAlertTitle}>İade Talebiniz Gönderildi</Text>
            </View>
            <Text style={styles.returnAlertDesc}>
              Talebiniz zanaatkâr onayında bekliyor. İade Gerekçesi:
            </Text>
            <Text style={styles.returnReasonText}>&ldquo;{existingReturn.reason}&rdquo;</Text>
          </View>
        )}

        {/* ─── Değerlendirme Formu (COMPLETED, değerlendirme yoksa) ─── */}
        {order.status === 'COMPLETED' && !existingReview && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>El İşçiliğini Değerlendirin</Text>
            <Text style={styles.reviewSubtitle}>Deneyiminizi puanlayarak diğer müşterilere yardımcı olun.</Text>

            {/* Stars row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#fbbf24' : '#ddc0b9'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="El işçiliği mükemmeldi, teşekkürler..."
              placeholderTextColor={theme.colors.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitReviewButton, (rating === 0 || isSubmittingReview) && styles.disabledButton]}
              onPress={handleSubmitReview}
              disabled={rating === 0 || isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitReviewText}>Değerlendirmeyi Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Mevcut Değerlendirme (COMPLETED, değerlendirme varsa) ─── */}
        {existingReview && (
          <View style={styles.existingReviewCard}>
            <View style={styles.existingReviewHeader}>
              <Text style={styles.existingReviewTitle}>Değerlendirmeniz</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingBadgeText}>{existingReview.rating}/5</Text>
              </View>
            </View>
            {existingReview.comment ? (
              <Text style={styles.existingReviewComment}>&ldquo;{existingReview.comment}&rdquo;</Text>
            ) : null}
            <Text style={styles.existingReviewDate}>
              {new Date(existingReview.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ─── ÖDEME MODALI (Credit Card Modal) ─── */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Param-Güvende Güvenli Ödeme</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: theme.spacing.md }}>
              <Text style={styles.modalDesc}>
                Anlaşılan ₺{order.agreedPrice?.toLocaleString('tr-TR')} tutarı, kartınızdan çekilerek Param-Güvende havuz hesabına aktarılacaktır.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Kart Numarası</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="number-pad"
                  maxLength={16}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                  <Text style={styles.modalLabel}>Son Kullanma</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="AA/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.modalLabel}>CVV</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="000"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmPayButton, isPaying && styles.disabledButton]}
                onPress={handleHoldPayment}
                disabled={isPaying}
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={18} color="#fff" />
                    <Text style={styles.confirmPayText}>Güvenli Ödeme Yap</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── İADE TALEBİ MODALI ─── */}
      <Modal visible={showReturnModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İade Başlat</Text>
              <TouchableOpacity onPress={() => setShowReturnModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: theme.spacing.md }}>
              <Text style={styles.modalDesc}>
                İade gerekçenizi açıklayın. Bu bilgi zanaatkâra onaylaması için gönderilecektir.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>İade Gerekçesi</Text>
                <TextInput
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Gelen ürünün ölçüsü hatalı/hasarlı..."
                  multiline
                  numberOfLines={4}
                  value={returnReason}
                  onChangeText={setReturnReason}
                />
              </View>

              <TouchableOpacity
                style={[styles.confirmReturnButton, isReturning && styles.disabledButton]}
                onPress={handleCreateReturn}
                disabled={isReturning}
              >
                {isReturning ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmReturnText}>İade Talebini Gönder</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── PARA AKTARIM BAŞARILI ANİMASYON ÖRTÜSÜ ─── */}
      {showSuccessOverlay && (
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={80} color="#16a34a" />
            <Text style={styles.successAmount}>₺{order.agreedPrice?.toLocaleString('tr-TR')}</Text>
            <Text style={styles.successTitleText}>Zanaatkâra Aktarıldı!</Text>
            <Text style={styles.successDescText}>Güvenli ticaret başarıyla tamamlandı.</Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  headerBack: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    maxWidth: '70%',
  },
  placeholder: {
    width: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  backButtonOutline: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 48,
  },
  imageContainer: {
    gap: theme.spacing.md,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  noImageText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  aiImageContainer: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  aiImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    resizeMode: 'cover',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    backgroundColor: '#f2ded9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.xs,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textMuted,
  },
  orderId: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  orderTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  orderDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f9f5f4',
    paddingTop: theme.spacing.md,
  },
  metadataItem: {
    minWidth: '45%',
  },
  metadataLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  priceText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
  },
  escrowCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#ddc0b9',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  successEscrowCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  escrowTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  escrowDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  chatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  chatIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  chatSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  chatButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.bold,
  },
  quotesSection: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  emptyQuotesCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyQuotesText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    position: 'relative',
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bestMatchBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
    gap: 3,
  },
  bestMatchText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  artisanTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  quotePrice: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  quoteDays: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  quoteMsg: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    backgroundColor: '#fbfbfb',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#f2eae9',
  },
  acceptQuoteButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  acceptQuoteButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  payTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  payDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
  },
  statusSuccessCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  statusSuccessTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#16a34a',
  },
  statusSuccessDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  deliveryTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  deliveryDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  deliveryActionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  deliveryRejectButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  deliveryRejectText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  deliveryAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  deliveryAcceptText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#fff',
  },
  returnAlertCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  returnAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  returnAlertTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: 'bold',
    color: '#92400e',
  },
  returnAlertDesc: {
    fontSize: theme.typography.fontSizes.xs,
    color: '#b45309',
  },
  returnReasonText: {
    fontSize: theme.typography.fontSizes.sm,
    color: '#b45309',
    fontStyle: 'italic',
    backgroundColor: '#fff',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  reviewTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  reviewSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  reviewInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    height: 80,
    padding: theme.spacing.md,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.sm,
  },
  submitReviewButton: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReviewText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.sm,
  },
  existingReviewCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  existingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  existingReviewTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#16a34a',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  existingReviewComment: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#e2f5e9',
    marginTop: 4,
  },
  existingReviewDate: {
    fontSize: 10,
    color: '#16a34a',
    textAlign: 'right',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  modalDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textDark,
  },
  confirmPayButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  confirmPayText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
  confirmReturnButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  confirmReturnText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
  // Success Overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  successAmount: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: theme.spacing.md,
  },
  successTitleText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 4,
  },
  successDescText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
