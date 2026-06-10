import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { portfolioApi, Portfolio, PortfolioItem } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';
export default function ArtisanPortfolioScreen({ navigation }: any) {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  const modalRef = useRef(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await portfolioApi.getPortfolio(user.userId);
      setPortfolio(res.data || null);
    } catch {
      setPortfolio(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPortfolio);
    return unsubscribe;
  }, [navigation, fetchPortfolio]);

  const openEditProfile = () => {
    if (!portfolio) return;
    setFullName(portfolio.full_name || '');
    setBio(portfolio.bio || '');
    setProfession(portfolio.profession || '');
    setSkillsStr((portfolio.skills || []).join(', '));
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    setSavingProfile(true);
    try {
      await portfolioApi.updatePortfolio({
        full_name: fullName.trim(),
        bio: bio.trim(),
        profession: profession.trim(),
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowEditProfile(false);
      fetchPortfolio();
    } catch (err: any) {
      setPortfolioError(err?.response?.data?.message || 'Profil güncellenemedi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemTitle.trim() || !itemImageUrl.trim()) return;
    setAddingItem(true);
    try {
      await portfolioApi.createItem({
        title: itemTitle.trim(),
        description: itemDesc.trim(),
        image_url: itemImageUrl.trim(),
        price: parseFloat(itemPrice) || 0,
      });
      setShowAddItem(false);
      setItemTitle('');
      setItemDesc('');
      setItemImageUrl('');
      setItemPrice('');
      fetchPortfolio();
    } catch (err: any) {
      setPortfolioError(err?.response?.data?.message || 'İş eklenemedi.');
    } finally {
      setAddingItem(false);
    }
  };

  const renderHeader = () => {
    if (!portfolio) return null;
    const avgRating = portfolio.rating_count > 0 ? (portfolio.rating_sum / portfolio.rating_count).toFixed(1) : '0';
    return (
      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color={theme.colors.primary} />
          </View>
          <Text style={styles.profileName}>{portfolio.full_name}</Text>
          {portfolio.profession ? <Text style={styles.profession}>{portfolio.profession}</Text> : null}
          {portfolio.bio ? <Text style={styles.bio}>{portfolio.bio}</Text> : null}
          {portfolio.skills && portfolio.skills.length > 0 ? (
            <View style={styles.skillsRow}>
              {portfolio.skills.map((skill, i) => (
                <View key={i} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{avgRating}</Text>
            <Text style={styles.ratingCount}>({portfolio.rating_count} değerlendirme)</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditProfile}>
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yapılan İşler</Text>
          <TouchableOpacity style={styles.addItemBtn} onPress={() => setShowAddItem(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addItemText}>İş Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.portfolioItem}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        {item.description ? <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text> : null}
        {item.price ? <Text style={styles.itemPrice}>₺{item.price.toLocaleString('tr-TR')}</Text> : null}
        <View style={styles.itemRating}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.itemRatingText}>{item.rating.toFixed(1)}</Text>
          {item.comment ? <Text style={styles.itemComment} numberOfLines={1}>"{item.comment}"</Text> : null}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Portfolyo</Text>
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
        <Text style={styles.headerTitle}>Portfolyo</Text>
      </View>

      {!portfolio ? (
        <View style={styles.centerContent}>
          <Ionicons name="images-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Portfolyo bulunamadı</Text>
          <Text style={styles.emptyDesc}>Profil oluşturarak portfolyonuzu başlatın.</Text>
        </View>
      ) : (
        <FlatList
          data={portfolio.items || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchPortfolio} tintColor={theme.colors.primary} />
          }
        />
      )}

      <Modal visible={showEditProfile} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEditProfile(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Profili Düzenle</Text>
                <Text style={styles.modalSub}>Bilgilerinizi güncelleyin</Text>
                <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor={theme.colors.textSecondary} value={fullName} onChangeText={setFullName} />
                <TextInput style={styles.input} placeholder="Meslek (Örn: Seramik Sanatçısı)" placeholderTextColor={theme.colors.textSecondary} value={profession} onChangeText={setProfession} />
                <TextInput style={styles.textArea} placeholder="Biyografi" placeholderTextColor={theme.colors.textSecondary} value={bio} onChangeText={setBio} multiline numberOfLines={3} textAlignVertical="top" />
                <TextInput style={styles.input} placeholder="Yetenekler (virgülle ayırın)" placeholderTextColor={theme.colors.textSecondary} value={skillsStr} onChangeText={setSkillsStr} />
                {portfolioError ? <Text style={styles.errorText}>{portfolioError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditProfile(false)}>
                    <Text style={styles.cancelBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, savingProfile && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showAddItem} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddItem(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>İş Ekle</Text>
                <TextInput style={styles.input} placeholder="Başlık" placeholderTextColor={theme.colors.textSecondary} value={itemTitle} onChangeText={setItemTitle} />
                <TextInput style={styles.textArea} placeholder="Açıklama" placeholderTextColor={theme.colors.textSecondary} value={itemDesc} onChangeText={setItemDesc} multiline numberOfLines={3} textAlignVertical="top" />
                <TextInput style={styles.input} placeholder="Görsel URL (https://...)" placeholderTextColor={theme.colors.textSecondary} value={itemImageUrl} onChangeText={setItemImageUrl} keyboardType="url" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Fiyat (₺)" placeholderTextColor={theme.colors.textSecondary} value={itemPrice} onChangeText={setItemPrice} keyboardType="numeric" />
                {portfolioError ? <Text style={styles.errorText}>{portfolioError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddItem(false)}>
                    <Text style={styles.cancelBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, addingItem && { opacity: 0.7 }]} onPress={handleAddItem} disabled={addingItem}>
                    {addingItem ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Ekle</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
    gap: theme.spacing.lg,
  },
  columnWrapper: {
    gap: theme.spacing.md,
  },
  profileSection: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  profession: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  bio: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  skillText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  ratingCount: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  editProfileText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addItemText: {
    fontSize: theme.typography.fontSizes.sm,
    color: '#fff',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  portfolioItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: theme.spacing.sm,
    gap: 4,
  },
  itemTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  itemDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemRatingText: {
    fontSize: 11,
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  itemComment: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  saveBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: theme.typography.fontSizes.md,
    color: '#fff',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.sm,
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
