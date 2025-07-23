import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { QueryResponse } from '@shared/schema';

export function useQueryMutation() {
  return useMutation({
    mutationFn: async (question: string): Promise<QueryResponse> => {
      const res = await apiRequest('POST', '/api/query', { question });
      return res.json();
    },
  });
}
