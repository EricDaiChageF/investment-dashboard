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
export declare const fetchStockPrice: (code: string, market: string) => Promise<StockPrice | null>;
export declare const fetchKlineData: (code: string, market: string, period?: string, limit?: number) => Promise<any>;
//# sourceMappingURL=eastmoney.d.ts.map