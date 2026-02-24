import axios from 'axios';
import { getDb } from '../utils/database';

// 东方财富API接口
const EASTMONEY_API = 'http://push2.eastmoney.com/api/qt/stock/get';
const EASTMONEY_KLINE_API = 'http://push2.eastmoney.com/api/qt/stock/kline/get';

// 股票代码映射（转换为东方财富格式）
const getEastMoneyCode = (code: string, market: string): string => {
  // A股格式: 市场+代码
  if (market === 'SH') return `1.${code}`;
  if (market === 'SZ') return `0.${code}`;
  // 港股格式
  if (market === 'HK') return `116.${code}`;
  // 美股格式
  if (market === 'US') return `105.${code}`;
  return code;
};

export interface StockPrice {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  preClose: number;
}

// 获取实时股价
export const fetchStockPrice = async (code: string, market: string): Promise<StockPrice | null> => {
  try {
    const secid = getEastMoneyCode(code, market);
    const response = await axios.get(EASTMONEY_API, {
      params: {
        secid,
        fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f170',
        _: Date.now()
      },
      timeout: 10000
    });
    
    const data = response.data?.data;
    if (!data) return null;
    
    // 东方财富字段说明:
    // f43: 当前价格(乘以0.01)
    // f44: 最高
    // f45: 最低
    // f46: 开盘
    // f47: 成交量
    // f48: 成交额
    // f57: 股票代码
    // f58: 股票名称
    // f60: 昨收
    // f170: 涨跌幅
    
    return {
      code: data.f57,
      name: data.f58,
      price: (data.f43 || 0) / 100,
      high: (data.f44 || 0) / 100,
      low: (data.f45 || 0) / 100,
      open: (data.f46 || 0) / 100,
      volume: data.f47 || 0,
      change: ((data.f43 || 0) - (data.f60 || 0)) / 100,
      changePercent: data.f170 || 0,
      preClose: (data.f60 || 0) / 100
    };
  } catch (error) {
    console.error(`Failed to fetch price for ${code}:`, error);
    return null;
  }
};

// 获取K线数据
export const fetchKlineData = async (code: string, market: string, period: string = '101', limit: number = 100) => {
  try {
    const secid = getEastMoneyCode(code, market);
    const response = await axios.get(EASTMONEY_KLINE_API, {
      params: {
        secid,
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: period, // 101:日, 102:周, 103:月
        fqt: '0', // 不复权
        end: '20500101',
        lmt: limit,
        _: Date.now()
      },
      timeout: 10000
    });
    
    const klines = response.data?.data?.klines || [];
    return klines.map((kline: string) => {
      const parts = kline.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        amount: parseFloat(parts[6]),
        amplitude: parseFloat(parts[7]),
        changePercent: parseFloat(parts[8]),
        change: parseFloat(parts[9]),
        turnover: parseFloat(parts[10])
      };
    });
  } catch (error) {
    console.error(`Failed to fetch kline for ${code}:`, error);
    return [];
  }
};