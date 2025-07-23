import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { QueryHistory } from '@shared/schema';

export default function QueryHistory() {
  const { data: history, isLoading } = useQuery<QueryHistory[]>({
    queryKey: ['/api/history'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Queries</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: Date) => {
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
    <Card className="rounded-2xl shadow-lg border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Queries</CardTitle>
          <span className="text-sm text-gray-500">
            {history ? `${history.length} of 10` : '0 of 10'}
          </span>
        </div>
      </CardHeader>
      <div className="divide-y divide-gray-100">
        {history && history.length > 0 ? (
          history.map((query, index) => (
            <div key={query.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-question text-primary text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{query.question}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(query.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No queries yet. Ask a question to get started!
          </div>
        )}
        
        {history && history.length > 0 && (
          <div className="p-4">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-primary hover:text-primary/80 font-medium"
            >
              View All History
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
