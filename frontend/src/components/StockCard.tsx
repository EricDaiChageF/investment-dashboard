import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Spin } from 'antd';
import { stockApi, Stock } from '../services/stock';
import { MARKET_MAP } from '../utils/constants';
import './StockCard.css';

const StockCard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await stockApi.getAll();
      setStocks(response.data);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) => {
    return `¥${(value || 0).toFixed(2)}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#cf1322';
    if (change < 0) return '#3f8600';
    return '#666';
  };

  if (loading) {
    return (
      <div className="stock-loading">
        <Spin />
      </div>
    );
  }

  return (
    <div className="stock-section">
      <h3 className="section-title">持仓股票</h3>
      <Row gutter={[16, 16]}>
        {stocks.map((stock) => {
          const currentPrice = stock.current_price || stock.avg_price;
          const changePercent = stock.change_percent || 0;
          const profit = (currentPrice - stock.avg_price) * stock.shares;
          const profitPercent = ((currentPrice - stock.avg_price) / stock.avg_price) * 100;

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={stock.id}>
              <Card className="stock-item-card" hoverable>
                <div className="stock-header">
                  <div className="stock-name">{stock.name}</div>
                  <Tag>{MARKET_MAP[stock.market] || stock.market}</Tag>
                </div>
                <div className="stock-code">{stock.code}</div>
                
                <div className="stock-price-row">
                  <span className="current-price" style={{ color: getChangeColor(changePercent) }}>
                    {formatMoney(currentPrice)}
                  </span>
                  <span className="change-percent" style={{ color: getChangeColor(changePercent) }}>
                    {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                  </span>
                </div>

                <div className="stock-info-row">
                  <div className="info-item">
                    <span className="label">持仓</span>
                    <span className="value">{stock.shares}股</span>
                  </div>
                  <div className="info-item">
                    <span className="label">成本</span>
                    <span className="value">{formatMoney(stock.avg_price)}</span>
                  </div>
                </div>

                <div className="stock-profit-row">
                  <span className="label">盈亏</span>
                  <span 
                    className="profit-value" 
                    style={{ color: profit >= 0 ? '#cf1322' : '#3f8600' }}
                  >
                    {profit >= 0 ? '+' : ''}{formatMoney(profit)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StockCard;