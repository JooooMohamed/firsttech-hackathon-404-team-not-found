import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppNotification, Transaction} from '../types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addFromTransaction: (tx: Transaction, merchantName: string) => void;
  addFromProgramLink: (programName: string) => void;
  addCustom: (icon: string, title: string, subtitle: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

let counter = 0;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, _get) => ({
      notifications: [],
      unreadCount: 0,

      addFromTransaction: (tx, merchantName) => {
        const isEarn = tx.type === 'earn';
        const notif: AppNotification = {
          id: `notif-${++counter}`,
          icon: isEarn ? '💰' : '🎁',
          title: isEarn
            ? `+${tx.points} EP Earned`
            : `${tx.points} EP Redeemed`,
          subtitle: `at ${merchantName}`,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: false,
        };
        set(state => ({
          notifications: [notif, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }));
      },

      addFromProgramLink: programName => {
        const notif: AppNotification = {
          id: `notif-${++counter}`,
          icon: '🔗',
          title: `${programName} Connected`,
          subtitle: 'Your loyalty program is now linked',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: false,
        };
        set(state => ({
          notifications: [notif, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }));
      },

      addCustom: (icon, title, subtitle) => {
        const notif: AppNotification = {
          id: `notif-${++counter}`,
          icon,
          title,
          subtitle,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: false,
        };
        set(state => ({
          notifications: [notif, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAllRead: () =>
        set(state => ({
          notifications: state.notifications.map(n => ({...n, read: true})),
          unreadCount: 0,
        })),

      clear: () => set({notifications: [], unreadCount: 0}),
    }),
    {
      name: 'easypoints-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        notifications: state.notifications.slice(0, 50),
        unreadCount: state.unreadCount,
      }),
    },
  ),
);
