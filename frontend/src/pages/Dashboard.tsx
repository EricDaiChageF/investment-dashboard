import { Card, Row, Col, Statistic, Button, Spin, message } from 'antd';
import { SyncOutlined, StockOutlined, WalletOutlined, RiseOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { dashboardApi, SummaryData } from '../services/dashboard';
import StockCard from '../components/StockCard';
import AllocationChart from '../components/AllocationChart';
import ReturnsChart from '../components/ReturnsChart';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await dashboardApi.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await dashboardApi.syncData();
      message.success('数据同步成功');
      fetchSummary();
      window.location.reload();
    } catch (error) {
      message.error('数据同步失败');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  const formatMoney = (value: number) => {
    return `¥${(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>投资周报</h1>
        <Button
          type="primary"
          icon={<SyncOutlined spin={syncing} />}
          onClick={handleSync}
          loading={syncing}
        >
          同步数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="持仓股票数"
              value={summary?.total_stocks || 0}
              prefix={<StockOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总市值"
              value={formatMoney(summary?.total_value || 0)}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总成本"
              value={formatMoney(summary?.total_cost || 0)}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收益率"
              value={summary?.total_return_percent || 0}
              precision={2}
              suffix="%"
              valueStyle={{
                color: (summary?.total_return_percent || 0) >= 0 ? '#cf1322' : '#3f8600',
              }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 股票卡片 */}
      <StockCard />

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={12}>
          <Card title="资产配置" className="chart-card">
            <AllocationChart />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="收益曲线" className="chart-card">
            <ReturnsChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;