import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SummaryData } from '@shared/schema';

export default function SummaryCard() {
  const { data: summary, isLoading, refetch } = useQuery<SummaryData>({
    queryKey: ['/api/summary'],
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">AI Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {summary ? (
          <div className="prose prose-sm text-gray-700">
            <p className="mb-3">Based on your current data analysis:</p>
            <ul className="space-y-2 text-sm">
              <li>• Total revenue: {formatCurrency(summary.totalRevenue)}</li>
              <li>• Top performing product: {summary.topProduct}</li>
              <li>• Average ROAS: {summary.averageRoas.toFixed(1)}x</li>
              <li>• Growth rate: {summary.growthRate}% month-over-month</li>
            </ul>
            {summary.keyInsights.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">Key Insights:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {summary.keyInsights.slice(0, 3).map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Unable to generate summary at this time.</div>
        )}
        <Button 
          onClick={() => refetch()}
          className="mt-4 w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200"
        >
          <i className="fas fa-refresh mr-2"></i>
          Generate Full Summary
        </Button>
      </CardContent>
    </Card>
  );
}
