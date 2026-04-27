import { create } from 'zustand';
import api from '../services/api';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

export const useChatStore = create((set, get) => ({
  channels: [],
  currentChannel: null,
  messages: [],
  directMessages: [],
  isLoading: false,
  error: null,

  initializeSocket: (userId) => {
    socket.emit('user:online', userId);

    socket.on('message:received', (data) => {
      set((state) => ({
        messages: [...state.messages, data],
      }));
    });
  },

  createChannel: async (channelData) => {
    try {
      const response = await api.post('/chat/channels', channelData);
      set((state) => ({
        channels: [...state.channels, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setCurrentChannel: (channel) => {
    set({ currentChannel: channel });
  },

  fetchChannelMessages: async (channelId, page = 1) => {
    try {
      const response = await api.get(
        `/chat/channels/${channelId}/messages?page=${page}&limit=50`
      );
      set({ messages: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/chat/messages', messageData);
      socket.emit('message:send', response.data);
      set((state) => ({
        messages: [...state.messages, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  editMessage: async (messageId, content) => {
    try {
      const response = await api.put(`/chat/messages/${messageId}`, {
        content,
      });
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? response.data : m
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter(m => m._id !== messageId),
      }));
    } catch (error) {
      throw error;
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const response = await api.post(
        `/chat/messages/${messageId}/reactions`,
        { emoji }
      );
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? response.data : m
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  disconnectSocket: () => {
    socket.disconnect();
  },
}));