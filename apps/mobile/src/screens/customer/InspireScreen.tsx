import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2;

const MOCK_INSPIRES = [
  {
    id: '1',
    title: 'Epoksi & Ceviz Masa',
    artisanName: 'Mehmet Usta',
    category: 'Ahşap Oyma',
    likes: 142,
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300',
  },
  {
    id: '2',
    title: 'Seramik Sırlı Vazo',
    artisanName: 'Ayşe Kaya',
    category: 'Seramik',
    likes: 89,
    image: 'https://images.unsplash.com/photo-1576016770956-debb63d900ee?w=300',
  },
  {
    id: '3',
    title: 'El Dikimi Deri Çanta',
    artisanName: 'Ahmet Yılmaz',
    category: 'Deri İşçiliği',
    likes: 215,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300',
  },
  {
    id: '4',
    title: 'Kök Zümrüt Gümüş Yüzük',
    artisanName: 'Zeynep Demir',
    category: 'Takı Tasarım',
    likes: 176,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
  },
  {
    id: '5',
    title: 'Ahşap Kakma Mücevher Kutusu',
    artisanName: 'Mehmet Usta',
    category: 'Ahşap Oyma',
    likes: 120,
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=300',
  },
  {
    id: '6',
    title: 'Terracotta Saksı Seti',
    artisanName: 'Ayşe Kaya',
    category: 'Seramik',
    likes: 95,
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=300',
  },
];

export default function InspireScreen() {
  const [items, setItems] = useState(MOCK_INSPIRES);
  const [likedItems, setLikedItems] = useState<string[]>([]);

  const handleLike = (id: string) => {
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter((item) => item !== id));
      setItems(items.map((item) => (item.id === id ? { ...item, likes: item.likes - 1 } : item)));
    } else {
      setLikedItems([...likedItems, id]);
      setItems(items.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item)));
    }
  };

  const renderInspireCard = ({ item }: { item: typeof MOCK_INSPIRES[0] }) => {
    const isLiked = likedItems.includes(item.id);
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        
        {/* Like Button overlay */}
        <TouchableOpacity
          style={styles.likeOverlay}
          onPress={() => handleLike(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? theme.colors.primary : '#fff'}
          />
        </TouchableOpacity>

        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.subRow}>
            <Text style={styles.artisanText} numberOfLines={1}>
              {item.artisanName}
            </Text>
            <View style={styles.likesCount}>
              <Ionicons name="heart" size={10} color={theme.colors.primary} />
              <Text style={styles.likesText}>{item.likes}</Text>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlham Al</Text>
        <Text style={styles.headerSubtitle}>
          Zanaatkârlarımızın en popüler el emeği çalışmalarını keşfedin.
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderInspireCard}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
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
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  likeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(35, 25, 22, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    padding: theme.spacing.md,
    gap: 4,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  artisanText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    flex: 1,
  },
  likesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likesText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.xs,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
