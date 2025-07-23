import { useState } from 'react';
import QueryInterface from '@/components/QueryInterface';
import ResultsSection from '@/components/ResultsSection';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useQuery } from '@tanstack/react-query';
import type { QueryResponse } from '@shared/schema';

export default function Home() {
  const [currentQuery, setCurrentQuery] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get data status
  const { data: dataStatus } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleQuerySubmit = (response: QueryResponse) => {
    setCurrentQuery(response);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-primary-foreground text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">E-Commerce AI Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                <i className="fas fa-database mr-1"></i>
                {dataStatus ? 
                  `${(dataStatus as any).adSales + (dataStatus as any).totalSales + (dataStatus as any).eligibility} records loaded` : 
                  '3 datasets loaded'
                }
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QueryInterface 
          onQuerySubmit={handleQuerySubmit}
          onLoadingChange={handleLoadingChange}
        />
        <ResultsSection currentQuery={currentQuery} />
      </main>

      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
