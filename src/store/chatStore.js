import { create } from 'zustand';
import api from '../services/api.js';
import { useSocketStore } from './socketStore.js';
import { useAuthStore } from './authStore.js';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeChat: null,
  messages: [],
  isLoading: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/chat/conversations');
      set({ conversations: data.data.conversations });
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/chat/${chatId}/messages`);
      set({ messages: data.data.messages, activeChat: chatId });
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveChat: (chatId) => {
    set({ activeChat: chatId });
    if (chatId) {
      get().fetchMessages(chatId);
    } else {
      set({ messages: [] });
    }
  },

  sendMessage: async (receiverId, content, chatId = null, productId = null) => {
    try {
      const { data } = await api.post('/chat/send', {
        receiverId,
        content,
        chatId: chatId || get().activeChat,
        productId
      });

      const { message, chatId: returnedChatId } = data.data;

      // Update local state
      if (get().activeChat == returnedChatId) {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      }

      // Update conversations list
      get().fetchConversations();

      return returnedChatId;
    } catch (error) {
      console.error('Failed to send message', error);
      throw error;
    }
  },

  addIncomingMessage: (chatId, message) => {
    // Use loose equality to handle ID format variations
    if (get().activeChat == chatId) {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    }
    get().fetchConversations();
  },

  unreadCount: () => {
    const { user } = useAuthStore.getState();
    if (!user) return 0;
    return get().conversations.reduce((acc, conv) => {
      return acc + (conv.unreadCount?.[user._id] || 0);
    }, 0);
  }
}));
