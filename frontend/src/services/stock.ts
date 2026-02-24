import api from './api';

export interface Stock {
  id: number;
  code: string;
  name: string;
  category: string;
  shares: number;
  avg_price: number;
  market: string;
  current_price?: number;
  change_percent?: number;
}

export interface StockPrice {
  id: number;
  stock_id: number;
  price: number;
  change_percent: number;
  date: string;
}

export const stockApi = {
  getAll: () => api.get<Stock[]>('/stocks'),
  getByCode: (code: string) => api.get<Stock>(`/stocks/${code}`),
  getHistory: (code: string, days?: number) => 
    api.get<StockPrice[]>(`/stocks/${code}/history`, { params: { days } }),
  create: (data: Partial<Stock>) => api.post('/stocks', data),
  update: (id: number, data: Partial<Stock>) => api.put(`/stocks/${id}`, data),
  delete: (id: number) => api.delete(`/stocks/${id}`),
};