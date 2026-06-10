import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi, ChatMessage } from '../../services/api';
import { theme } from '../../theme/theme';

export default function ChatScreen({ route, navigation }: any) {
  const { otherUserId, otherUserName, orderId } = route.params;
  const { user, token } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 1. Fetch chat history
  const loadChatHistory = useCallback(async () => {
    try {
      const res = await chatApi.getChatHistory(otherUserId);
      setMessages(res.data || []);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  // 2. Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://18.192.48.116:8081/api/v1/chat/ws?token=${token}`;
    console.log('📡 Connecting WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Connected!');
      setWsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      const lines = event.data.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as ChatMessage;
          console.log('📬 WS Message received:', msg);

          // Append if it's part of this conversation
          if (
            msg.senderId === otherUserId ||
            msg.receiverId === otherUserId
          ) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === msg.id && msg.id !== undefined)) {
                return prev;
              }
              return [...prev, msg];
            });
          }
        } catch (err) {
          console.error('WS Parse Message error:', err);
        }
      }
    };

    ws.onclose = (e) => {
      console.log('🔌 WebSocket disconnected. Reconnecting in 3 seconds...', e.reason);
      setWsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      ws.close();
    };
  }, [token, otherUserId]);

  useEffect(() => {
    loadChatHistory();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [otherUserId, loadChatHistory, connectWebSocket]);

  // Auto scroll to end on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      receiverId: otherUserId,
      receiverName: otherUserName,
      senderName: user?.fullName || 'Kullanıcı',
      content: inputText.trim(),
      orderId: orderId || '',
    };

    console.log('✉️ Sending payload:', payload);
    socketRef.current.send(JSON.stringify(payload));
    
    // Optimistic local update before WS echo (in case backend does not echo back quickly)
    const localMsg: ChatMessage = {
      senderId: user?.userId || '',
      senderName: user?.fullName || 'Kullanıcı',
      receiverId: otherUserId,
      receiverName: otherUserName,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      orderId: orderId || undefined,
      isRead: false,
    };
    
    setMessages((prev) => [...prev, localMsg]);
    setInputText('');
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.userId;
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
            {item.content}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeText, isMe ? styles.timeTextRight : styles.timeTextLeft]}>
              {formatTime(item.timestamp)}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={12}
                color={item.isRead ? '#4ade80' : '#d1d5db'}
                style={{ marginLeft: 2 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, wsConnected ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{wsConnected ? 'Bağlantı Aktif' : 'Bağlantı Kesildi'}</Text>
          </View>
        </View>
        {orderId ? (
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { id: orderId } })}
          >
            <Ionicons name="receipt-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.orderButtonText}>Sipariş</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Chat History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onLayout={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Message Form Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  headerName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  orderButtonText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9d6d1',
    borderBottomLeftRadius: 2,
  },
  bubbleRight: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: theme.colors.textDark,
  },
  messageTextRight: {
    color: '#fff',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
  },
  timeTextLeft: {
    color: theme.colors.textMuted,
  },
  timeTextRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    backgroundColor: '#fff8f6',
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#ddc0b9',
    elevation: 0,
    shadowOpacity: 0,
  },
});
