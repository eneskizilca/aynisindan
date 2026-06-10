import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { chatApi, Conversation } from '../../services/api';
import { theme } from '../../theme/theme';

export default function MessagesScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchConversations = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError('');
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data || []);
    } catch (err: any) {
      console.error('Fetch conversations error:', err);
      setError('Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when screen focuses to ensure updated unread counts
  useFocusEffect(
    useCallback(() => {
      fetchConversations(false);
    }, [fetchConversations])
  );

  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations(false);
  };

  const handleSelectConversation = (item: Conversation) => {
    navigation.navigate('ChatDetail', {
      otherUserId: item.counterPartyId,
      otherUserName: item.counterPartyName,
      orderId: item.lastOrderId,
    });
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.threadCard}
      activeOpacity={0.8}
      onPress={() => handleSelectConversation(item)}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={theme.colors.primary} />
      </View>

      <View style={styles.threadInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.counterPartyName}</Text>
          <Text style={styles.timeText}>{formatTime(item.lastTimestamp)}</Text>
        </View>

        <View style={styles.msgRow}>
          <Text
            style={[
              styles.msgText,
              item.unreadCount > 0 ? styles.msgTextUnread : null,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>

        {item.lastOrderId && (
          <View style={styles.orderBadge}>
            <Ionicons name="receipt-outline" size={10} color={theme.colors.primary} />
            <Text style={styles.orderBadgeText}>İlişkili Sipariş</Text>
          </View>
        )}
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

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchConversations(true)}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.counterPartyId}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Henüz hiç mesajınız bulunmuyor.</Text>
            </View>
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
    paddingBottom: 100,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  msgTextUnread: {
    fontWeight: 'bold',
    color: theme.colors.textDark,
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
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  orderBadgeText: {
    fontSize: 9,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: '#fff',
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
