import {Platform} from 'react-native';

// ─── Server URL ──────────────────────────────────────────
// PRODUCTION: Points to the deployed Render server (works from anywhere).
// The server connects to MongoDB Atlas — all data is live.
export const API_BASE_URL = 'https://easypoints-api.onrender.com/api';

// ─── For LOCAL development only (uncomment and comment the line above) ───
// const SERVER_IP = '192.168.1.8';
// const SERVER_PORT = 3000;
// export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;

export const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  secondary: '#00C9A7',
  background: '#F8F9FE',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  earn: '#10B981',
  redeem: '#EF4444',
  cardGradientStart: '#6C63FF',
  cardGradientEnd: '#A78BFA',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 40,
};
