import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { dashboardApi, ReturnItem } from '../services/dashboard';

const ReturnsChart = () => {
  const [data, setData] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await dashboardApi.getReturns(30);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOption = () => {
    const dates = data.map(item => item.date);
    const profits = data.map(item => Number(item.total_profit.toFixed(2)));
    const returns = data.map(item => Number(item.return_percent.toFixed(2)));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['盈亏金额', '收益率'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          formatter: (value: string) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '盈亏(元)',
          position: 'left',
          axisLabel: {
            formatter: '¥{value}',
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '收益率(%)',
          position: 'right',
          axisLabel: {
            formatter: '{value}%',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '盈亏金额',
          type: 'line',
          smooth: true,
          data: profits,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.05)' },
              ],
            },
          },
          lineStyle: {
            color: '#5470c6',
            width: 2,
          },
          itemStyle: {
            color: '#5470c6',
          },
        },
        {
          name: '收益率',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: returns,
          lineStyle: {
            color: '#91cc75',
            width: 2,
          },
          itemStyle: {
            color: '#91cc75',
          },
        },
      ],
    };
  };

  if (loading) {
    return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>;
  }

  if (data.length === 0) {
    return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>暂无数据</div>;
  }

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: 350 }}
      opts={{ renderer: 'svg' }}
    />
  );
};

export default ReturnsChart;