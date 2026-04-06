import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore.js';
import { useChatStore } from './chatStore.js';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadNotifications: 0,

  connect: () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken || get().socket) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken }
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('NOTIFICATION_RECEIVED', (notification) => {
      console.log('Real-time notification received:', notification);
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      }));
      toast.success(`${notification.title}: ${notification.message}`, {
        icon: '🔔',
        duration: 5000
      });
    });

    socket.on('MESSAGE_RECEIVED', ({ chatId, message }) => {
      console.log('Real-time message received for chat:', chatId, message);
      // Update chat store
      useChatStore.getState().addIncomingMessage(chatId, message);

      // Show toast if not on chat page
      if (window.location.pathname !== '/messages') {
        toast(`${message.sender.name}: ${message.content}`, {
          icon: '💬',
          duration: 4000
        });
      }
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadNotifications: unread });
  },

  markNotificationsAsRead: () => {
    set({ unreadNotifications: 0 });
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  }
}));
