import { useQuery } from '@tanstack/react-query';
import type { AnalyticsData, SummaryData } from '@shared/schema';

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useSummary() {
  return useQuery<SummaryData>({
    queryKey: ['/api/summary'],
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}
