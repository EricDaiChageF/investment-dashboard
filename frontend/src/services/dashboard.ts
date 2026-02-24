import api from './api';

export interface AllocationItem {
  category: string;
  value: number;
}

export interface ReturnItem {
  date: string;
  total_profit: number;
  total_cost: number;
  return_percent: number;
}

export interface SummaryData {
  total_stocks: number;
  total_value: number;
  total_cost: number;
  total_return_percent: number;
}

export const dashboardApi = {
  getAllocation: () => api.get<AllocationItem[]>('/dashboard/allocation'),
  getReturns: (days?: number) => api.get<ReturnItem[]>('/dashboard/returns', { params: { days } }),
  getSummary: () => api.get<SummaryData>('/dashboard/summary'),
  syncData: () => api.post('/dashboard/sync'),
};