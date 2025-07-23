import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsDashboard from './AnalyticsDashboard';
import QueryHistory from './QueryHistory';
import SummaryCard from './SummaryCard';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { QueryResponse } from '@shared/schema';

interface ResultsSectionProps {
  currentQuery: QueryResponse | null;
}

export default function ResultsSection({ currentQuery }: ResultsSectionProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/history');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Success",
        description: "Query history cleared",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear history",
        variant: "destructive",
      });
    },
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200"
        >
          <i className="fas fa-search"></i>
          <span>Analytics</span>
        </Button>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors duration-200"
        >
          <i className="fas fa-history"></i>
          <span>History</span>
        </Button>
        <Button
          onClick={() => clearHistoryMutation.mutate()}
          disabled={clearHistoryMutation.isPending}
          className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
        >
          <i className={`fas ${clearHistoryMutation.isPending ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
          <span>Clear History</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Panel */}
        <div className="lg:col-span-2">
          {/* Query Response Card */}
          {currentQuery && (
            <Card className="rounded-2xl shadow-lg border border-gray-200 mb-6">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Latest Query Result</CardTitle>
                  <span className="text-sm text-gray-500">{formatTimestamp(currentQuery.timestamp)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Question:</h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{currentQuery.question}</p>
                </div>
                {currentQuery.sql && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Generated SQL:</h4>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{currentQuery.sql}</code>
                    </pre>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Answer:</h4>
                  <div className={`border-l-4 p-4 rounded-r-lg ${
                    currentQuery.success 
                      ? 'bg-blue-50 border-primary' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <p className="text-gray-900">{currentQuery.answer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span><i className="fas fa-clock mr-1"></i>Response time: {currentQuery.executionTime}ms</span>
                  <span><i className="fas fa-database mr-1"></i>{currentQuery.tablesQueried} table{currentQuery.tablesQueried !== 1 ? 's' : ''} queried</span>
                  <span>
                    <i className={`fas ${currentQuery.success ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'} mr-1`}></i>
                    {currentQuery.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Dashboard */}
          {showAnalytics && <AnalyticsDashboard />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SummaryCard />
          {showHistory && <QueryHistory />}
          
          {/* Data Status Card */}
          <Card className="rounded-2xl shadow-lg border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Data Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ad Sales Metrics</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-900">Active</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sales Metrics</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-900">Active</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eligibility Table</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-900">Active</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last updated: Just now</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
