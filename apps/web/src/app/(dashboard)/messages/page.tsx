'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatApi, ChatMessage, Conversation } from '@/services/api';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const WS_BASE_URL = (process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://localhost:8081/api/v1')
  .replace(/^http/, 'ws') + '/chat/ws';

export default function MessagesPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      console.error('Conversations load error:', err);
    }
  }, []);

  // 2. Fetch history of messages for selected user
  const loadChatHistory = useCallback(async (otherId: string) => {
    setLoadingHistory(true);
    try {
      const res = await chatApi.getChatHistory(otherId);
      setMessages(res.data || []);
      // Refresh list to update unread counts
      loadConversations();
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadConversations]);

  // 3. Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    console.log('📡 Connecting to WebSocket...', WS_BASE_URL);
    const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Connected!');
      setWsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      // Split by newline to support Gorilla packet bundling
      const lines = event.data.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as ChatMessage;
          console.log('📬 WS Message received:', msg);
          
          // If message is from/to the currently active user, append to messages
          if (selectedUserId && (msg.senderId === selectedUserId || msg.receiverId === selectedUserId)) {
            setMessages(prev => {
              // Avoid duplicate logs if echo and broadcast overlap
              if (prev.some(m => m.id === msg.id && msg.id !== undefined)) return prev;
              return [...prev, msg];
            });
          }

          // Reload sidebar to reflect new message and update counts
          loadConversations();
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
  }, [token, selectedUserId, loadConversations]);

  // Handle initial WebSocket setup and sidebar loading
  useEffect(() => {
    if (token) {
      loadConversations();
      connectWebSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token, connectWebSocket, loadConversations]);

  // Handle URL Redirection parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryUserId = params.get('userId');
      const queryUserName = params.get('userName');
      const queryOrderId = params.get('orderId');
      
      if (queryUserId && queryUserName) {
        setSelectedUserId(queryUserId);
        setSelectedUserName(decodeURIComponent(queryUserName));
        if (queryOrderId) {
          setSelectedOrderId(queryOrderId);
        }
      }
    }
  }, []);

  // Fetch chat history whenever selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadChatHistory(selectedUserId);
    }
  }, [selectedUserId, loadChatHistory]);

  // Scroll to bottom of chat log when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      receiverId: selectedUserId,
      receiverName: selectedUserName || 'Kullanıcı',
      senderName: user?.fullName || 'Kullanıcı',
      content: inputText.trim(),
      orderId: selectedOrderId || '',
    };

    console.log('✉️ Sending payload:', payload);
    socketRef.current.send(JSON.stringify(payload));
    setInputText('');
  };

  const selectChat = (counterPartyId: string, counterPartyName: string, orderId?: string) => {
    setSelectedUserId(counterPartyId);
    setSelectedUserName(counterPartyName);
    setSelectedOrderId(orderId || null);
  };

  // Compile final sidebar conversation items
  const conversationList = [...conversations];
  if (selectedUserId) {
    const exists = conversations.some(c => c.counterPartyId === selectedUserId);
    if (!exists) {
      // Append a virtual conversation so the pre-selected user renders in sidebar
      conversationList.unshift({
        counterPartyId: selectedUserId,
        counterPartyName: selectedUserName || 'Zanaatkâr',
        lastMessage: 'Sohbeti başlatın...',
        lastTimestamp: new Date().toISOString(),
        lastOrderId: selectedOrderId || undefined,
        unreadCount: 0
      });
    }
  }

  // Helper to format timestamps
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-[#fff8f6]">
      {/* ─── Sidebar: Active Conversations ──────────────────────── */}
      <div className="w-full lg:w-96 border-r border-[#e9d6d1] flex flex-col flex-shrink-0 bg-white h-1/2 lg:h-full">
        <div className="p-4 border-b border-[#e9d6d1] bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#231916]">Mesajlarım</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-semibold text-[#8a726b] uppercase tracking-wide">
                {wsConnected ? 'Canlı Bağlantı Aktif' : 'Bağlantı Aranıyor...'}
              </span>
            </div>
          </div>
          <button 
            onClick={loadConversations} 
            className="p-1.5 rounded-lg hover:bg-[#fff1ed] text-[#de6b48] transition-colors cursor-pointer"
            title="Yenile"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation List Scroll View */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#fcf5f3]">
          {conversationList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-[#ddc0b9] mx-auto mb-2" />
              <p className="text-sm text-[#56423d] font-medium">Aktif mesajlaşma bulunmuyor</p>
              <p className="text-xs text-[#8a726b] mt-1">
                Teklifleriniz veya siparişleriniz üzerinden mesajlaşma başlatabilirsiniz.
              </p>
            </div>
          ) : (
            conversationList.map((conv) => {
              const isSelected = selectedUserId === conv.counterPartyId;
              return (
                <button
                  key={conv.counterPartyId}
                  onClick={() => selectChat(conv.counterPartyId, conv.counterPartyName, conv.lastOrderId)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#fff1ed]' : 'hover:bg-[#fffaf9]'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-[#fcf2ef] border border-[#f0deda] flex items-center justify-center text-[#de6b48] flex-shrink-0">
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-sm text-[#231916] truncate">
                        {conv.counterPartyName}
                      </h4>
                      <span className="text-[10px] text-[#8a726b] flex-shrink-0">
                        {formatTime(conv.lastTimestamp)}
                      </span>
                    </div>
                    
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#de6b48] font-bold' : 'text-[#8a726b]'}`}>
                      {conv.lastMessage}
                    </p>

                    {conv.lastOrderId && (
                      <div className="inline-flex items-center gap-1 mt-1 text-[10px] bg-[#f8e4df] text-[#de6b48] px-2 py-0.5 rounded-full font-medium">
                        <ShoppingBagIcon className="w-3 h-3" />
                        <span>Sipariş Detayı</span>
                      </div>
                    )}
                  </div>

                  {/* Unread Counter Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#E60023] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 self-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Chat Viewport Panel ────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#fff8f6] h-1/2 lg:h-full overflow-hidden">
        {selectedUserId ? (
          <>
            {/* Active User Header */}
            <div className="p-4 border-b border-[#e9d6d1] bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff1ed] flex items-center justify-center text-[#de6b48]">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#231916]">
                    {selectedUserName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#8a726b]">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    <span>Zanaatkâr / Müşteri Sohbeti</span>
                  </div>
                </div>
              </div>

              {selectedOrderId && (
                <Link
                  href={`/orders/${selectedOrderId}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#de6b48] bg-[#fff1ed] hover:bg-[#feeae5] px-3.5 py-2 rounded-lg font-semibold border border-[#f5ded9] transition-all cursor-pointer"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  Siparişi Görüntüle
                </Link>
              )}
            </div>

            {/* Message Feed Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-blueprint-grid">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-[#de6b48] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user?.userId;
                  return (
                    <div 
                      key={`${msg.id || index}`}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%] ${
                        isMe ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <div className={`p-3.5 rounded-2xl shadow-sm leading-relaxed text-[15px] ${
                        isMe 
                          ? 'bg-[#de6b48] text-white rounded-br-none' 
                          : 'bg-white text-[#231916] rounded-bl-none border border-[#e9d6d1]/50'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#8a726b] mt-1 px-1.5 flex items-center gap-1">
                        {formatTime(msg.timestamp)}
                        {isMe && (
                          <span className={`w-1 h-1 rounded-full ${msg.isRead ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Form Bar */}
            <div className="p-4 bg-white border-t border-[#e9d6d1] flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-3 rounded-full border border-[#ddc0b9] bg-white text-[#231916] placeholder-[#8a726b] focus:outline-none focus:ring-2 focus:ring-[#de6b48] focus:border-transparent transition-all duration-150"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || !wsConnected}
                  className="w-12 h-12 rounded-full bg-[#de6b48] hover:bg-[#c45a38] disabled:bg-[#ddc0b9] text-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer shadow-md active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45 -mt-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Idle Viewport Help guide */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-blueprint-grid">
            <div className="w-20 h-20 rounded-full bg-white border border-[#e9d6d1] flex items-center justify-center text-[#de6b48] shadow-sm mb-4">
              <ChatBubbleLeftRightIcon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-[#231916] mb-1">
              Sohbet Seçin
            </h3>
            <p className="text-sm text-[#8a726b] max-w-sm">
              Sol taraftaki listeden aktif bir sohbet seçebilir ya da aktif siparişleriniz altındaki "Mesaj Gönder" butonuna tıklayarak yeni bir sohbet başlatabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
