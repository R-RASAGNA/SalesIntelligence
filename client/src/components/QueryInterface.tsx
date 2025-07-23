import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { QueryResponse } from '@shared/schema';

interface QueryInterfaceProps {
  onQuerySubmit: (response: QueryResponse) => void;
  onLoadingChange: (loading: boolean) => void;
}

const sampleQuestions = [
  { text: "What is my total sales?", icon: "fas fa-chart-bar" },
  { text: "Which product had the highest CPC?", icon: "fas fa-dollar-sign" },
  { text: "What is the return on ad spend (RoAS)?", icon: "fas fa-percentage" },
  { text: "Show product-wise revenue", icon: "fas fa-chart-pie" },
  { text: "Compare ad spend vs clicks", icon: "fas fa-chart-line" },
  { text: "Show top performing products", icon: "fas fa-trending-up" },
];

export default function QueryInterface({ onQuerySubmit, onLoadingChange }: QueryInterfaceProps) {
  const [question, setQuestion] = useState('');
  const { toast } = useToast();

  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest('POST', '/api/query', { question });
      return res.json();
    },
    onMutate: () => {
      onLoadingChange(true);
    },
    onSuccess: (data: QueryResponse) => {
      onLoadingChange(false);
      onQuerySubmit(data);
      if (data.success) {
        toast({
          title: "Query executed successfully",
          description: `Response time: ${data.executionTime}ms`,
        });
      } else {
        toast({
          title: "Query failed",
          description: data.answer,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      onLoadingChange(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }
    queryMutation.mutate(question.trim());
  };

  const handleSampleClick = (sampleQuestion: string) => {
    setQuestion(sampleQuestion);
    queryMutation.mutate(sampleQuestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Ask me anything about your business data</h2>
      <p className="text-lg text-gray-600 mb-8">Get instant insights from your sales, ad spend, and product performance data</p>
      
      {/* Main Query Input */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:border-primary focus-within:border-primary transition-colors duration-200">
            <div className="flex-1 p-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-none border-0 focus:ring-0 text-lg placeholder-gray-400 bg-transparent"
                rows={1}
                placeholder="Ask me anything about your sales, ad spend, or product performance..."
              />
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={queryMutation.isPending || !question.trim()}
              className="m-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Ask
            </Button>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="max-w-4xl mx-auto mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Try these sample questions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleQuestions.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSampleClick(sample.text)}
              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 text-left group h-auto justify-start"
            >
              <div className="flex items-start space-x-3">
                <i className={`${sample.icon} text-primary mt-1 group-hover:text-primary`}></i>
                <span className="text-gray-700 group-hover:text-gray-900">{sample.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
