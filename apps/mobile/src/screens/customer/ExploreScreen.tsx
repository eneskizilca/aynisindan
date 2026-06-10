import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const MOCK_ARTISANS = [
  {
    id: '1',
    name: 'Mehmet Usta',
    profession: 'Ahşap Oyma ve Kakma',
    rating: 4.9,
    reviewCount: 38,
    city: 'Bursa',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    id: '2',
    name: 'Ayşe Kaya',
    profession: 'El Yapımı Çömlek & Seramik',
    rating: 4.8,
    reviewCount: 29,
    city: 'Kapadokya',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: '3',
    name: 'Ahmet Yılmaz',
    profession: 'Deri İşçiliği ve Çanta',
    rating: 4.95,
    reviewCount: 52,
    city: 'İstanbul',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '4',
    name: 'Zeynep Demir',
    profession: 'Gümüş Takı Tasarımı',
    rating: 4.75,
    reviewCount: 22,
    city: 'Mardin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
];

const CATEGORIES = [
  { name: 'Hepsi', icon: 'apps-outline' },
  { name: 'Ahşap', icon: 'hammer-outline' },
  { name: 'Seramik', icon: 'partly-sunny-outline' },
  { name: 'Takı', icon: 'gift-outline' },
  { name: 'Deri', icon: 'wallet-outline' },
];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');

  const filteredArtisans = MOCK_ARTISANS.filter((artisan) => {
    const matchesSearch =
      artisan.name.toLowerCase().includes(search.toLowerCase()) ||
      artisan.profession.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const renderArtisan = ({ item }: { item: typeof MOCK_ARTISANS[0] }) => (
    <View style={styles.artisanCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.artisanInfo}>
        <Text style={styles.artisanName}>{item.name}</Text>
        <Text style={styles.artisanProfession}>{item.profession}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewText}>({item.reviewCount} Değerlendirme)</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.locationText}>{item.city}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Zanaatkâr veya el sanatı arayın..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Slider */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.name && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.name)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={selectedCategory === item.name ? '#fff' : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item.name && styles.categoryChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Artisans list */}
      <FlatList
        data={filteredArtisans}
        keyExtractor={(item) => item.id}
        renderItem={renderArtisan}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Popüler Zanaatkârlar</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Aradığınız kriterlere uygun zanaatkâr bulunamadı.</Text>
          </View>
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
    borderRadius: theme.borderRadius.md,
    height: 44,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.sm,
    height: '100%',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 4,
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.medium,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  artisanCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  artisanInfo: {
    flex: 1,
    gap: 2,
  },
  artisanName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  artisanProfession: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  reviewText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
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
});
