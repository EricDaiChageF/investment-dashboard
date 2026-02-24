import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { dashboardApi, AllocationItem } from '../services/dashboard';

const AllocationChart = () => {
  const [data, setData] = useState<AllocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await dashboardApi.getAllocation();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOption = () => {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
      },
      series: [
        {
          name: '资产配置',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item, index) => ({
            value: Number(item.value.toFixed(2)),
            name: item.category,
            itemStyle: { color: colors[index % colors.length] },
          })),
        },
      ],
    };
  };

  if (loading) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>;
  }

  if (data.length === 0) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>暂无数据</div>;
  }

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: 350 }}
      opts={{ renderer: 'svg' }}
    />
  );
};

export default AllocationChart;