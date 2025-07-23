import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import type { AnalyticsData } from '@shared/schema';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Failed to load analytics data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Ad Spend ($)' } },
      y: { title: { display: true, text: 'Revenue ($)' } },
    },
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Analytics Dashboard</CardTitle>
        <p className="text-gray-600 mt-1">Visual insights from your data</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue by Product</h4>
            <div className="h-48 bg-white rounded-lg border border-gray-200 p-2">
              {analytics.barChart.labels.length > 0 ? (
                <Bar
                  data={{
                    labels: analytics.barChart.labels,
                    datasets: [{
                      data: analytics.barChart.data,
                      backgroundColor: 'hsl(207, 90%, 54%)',
                      borderRadius: 4,
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
          
          {/* Line Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ad Spend Trend</h4>
            <div className="h-48 bg-white rounded-lg border border-gray-200 p-2">
              {analytics.lineChart.labels.length > 0 ? (
                <Line
                  data={{
                    labels: analytics.lineChart.labels,
                    datasets: [{
                      data: analytics.lineChart.data,
                      borderColor: 'hsl(142, 76%, 36%)',
                      backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
                      tension: 0.4,
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Market Share</h4>
            <div className="h-48 bg-white rounded-lg border border-gray-200 p-2">
              {analytics.pieChart.labels.length > 0 ? (
                <Pie
                  data={{
                    labels: analytics.pieChart.labels,
                    datasets: [{
                      data: analytics.pieChart.data,
                      backgroundColor: [
                        'hsl(207, 90%, 54%)',
                        'hsl(142, 76%, 36%)',
                        'hsl(43, 89%, 58%)',
                        'hsl(0, 84%, 60%)',
                        'hsl(262, 83%, 58%)',
                        'hsl(204, 86%, 53%)',
                        'hsl(336, 84%, 57%)',
                        'hsl(24, 74%, 58%)',
                      ],
                    }]
                  }}
                  options={pieOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
          
          {/* Scatter Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ad Spend vs Revenue</h4>
            <div className="h-48 bg-white rounded-lg border border-gray-200 p-2">
              {analytics.scatterChart.data.length > 0 ? (
                <Scatter
                  data={{
                    datasets: [{
                      data: analytics.scatterChart.data,
                      backgroundColor: 'hsl(239, 84%, 67%)',
                      borderColor: 'hsl(239, 84%, 67%)',
                    }]
                  }}
                  options={scatterOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
