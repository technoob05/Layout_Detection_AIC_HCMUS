import { TranslationHistoryList } from './TranslationHistoryList';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

export function TranslationHistoryPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Translation History</h1>
          
          <Button asChild variant="outline" className="gap-2">
            <Link to="/analytics">
              <BarChart2 className="size-4" />
              View Analytics
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-8">
          View and manage your previous translation tasks
        </p>
        
        <TranslationHistoryList />
      </div>
    </MainLayout>
  );
} 