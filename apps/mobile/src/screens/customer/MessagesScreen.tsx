import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'Mehmet Usta',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    lastMessage: 'Masa siparişinizin epoksi dökümünü bugün yapıyorum.',
    time: '14:23',
    unreadCount: 2,
    role: 'Ahşap Zanaatkârı',
  },
  {
    id: '2',
    name: 'Ayşe Kaya',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    lastMessage: 'Tabii, vazo ölçülerini 30cm olarak güncelleyebiliriz.',
    time: 'Dün',
    unreadCount: 0,
    role: 'Seramik Zanaatkârı',
  },
  {
    id: '3',
    name: 'Ahmet Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastMessage: 'Kargo takip numarasını sisteme girdim, bilginiz olsun.',
    time: 'Pzt',
    unreadCount: 0,
    role: 'Deri Zanaatkârı',
  },
];

export default function MessagesScreen() {
  const renderConversationItem = ({ item }: { item: typeof MOCK_CONVERSATIONS[0] }) => (
    <TouchableOpacity style={styles.threadCard} activeOpacity={0.8}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.threadInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        
        <Text style={styles.roleText}>{item.role}</Text>
        
        <View style={styles.msgRow}>
          <Text style={styles.msgText} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlarım</Text>
        <Text style={styles.headerSubtitle}>
          Siparişlerinizle ilgili zanaatkârlar ile yaptığınız yazışmaları takip edin.
        </Text>
      </View>

      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Henüz hiç mesajınız bulunmuyor.</Text>
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
  },
  threadCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  threadInfo: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  timeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  roleText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    gap: theme.spacing.md,
  },
  msgText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
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
  },
});
