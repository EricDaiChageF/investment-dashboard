declare const router: import("express-serve-static-core").Router;
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
export default router;
//# sourceMappingURL=stocks.d.ts.map