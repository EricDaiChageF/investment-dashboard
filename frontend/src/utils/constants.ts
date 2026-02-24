// API基础URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'investment_token',
  USER: 'investment_user',
};

// 股票市场映射
export const MARKET_MAP: Record<string, string> = {
  'SH': '上证',
  'SZ': '深证',
  'HK': '港股',
  'US': '美股',
};