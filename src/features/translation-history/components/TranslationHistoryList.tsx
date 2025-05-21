import { useState } from 'react';
import { TranslationTask } from '@/features/pdf-translator/types';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { pdfTranslationApi } from '@/features/pdf-translator/api/pdfTranslationApi';

export function TranslationHistoryList() {
  const { history, removeFromHistory, clearHistory } = useTranslationHistory();
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState<{ [key: string]: boolean }>({});

  // Filter and sort the history
  const filteredAndSortedHistory = [...history]
    .filter(task => {
      if (filterStatus === 'all') return true;
      return task.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.startTime.getTime() - a.startTime.getTime();
      } else {
        return a.fileName.localeCompare(b.fileName);
      }
    });

  const handleDownload = async (task: TranslationTask) => {
    try {
      setIsDownloading(prev => ({ ...prev, [task.id]: true }));
      
      // If this is a completed task, download the translated PDF from the API
      if (task.status === 'completed') {
        // Download the translated PDF
        const blob = await pdfTranslationApi.downloadTranslatedPdf(task.id, 'dual');
        
        if (!blob) {
          toast.error('Translation no longer available on the server');
          setIsDownloading(prev => ({ ...prev, [task.id]: false }));
          return;
        }
        
        // Create a URL and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${task.fileName.replace('.pdf', '')}_translated.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Download started');
      } else {
        // For non-completed tasks, show an error
        toast.error('This translation is not completed yet');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const handleDelete = (taskId: string) => {
    removeFromHistory(taskId);
    toast.success('Item removed from history');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-blue-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Translation History</h2>
        
        <div className="flex space-x-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'name')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="destructive" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>
      
      {filteredAndSortedHistory.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-md">
          <p className="text-muted-foreground">No translation history found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedHistory.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="truncate" title={task.fileName}>
                  {task.fileName}
                </CardTitle>
                <CardDescription>
                  {formatDate(task.startTime)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="text-muted-foreground">From:</div>
                  <div>{task.options.source_lang}</div>
                  
                  <div className="text-muted-foreground">To:</div>
                  <div>{task.options.target_lang}</div>
                  
                  <div className="text-muted-foreground">Service:</div>
                  <div>{task.options.service}</div>
                  
                  <div className="text-muted-foreground">Status:</div>
                  <div className={getStatusColor(task.status)}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(task)}
                  disabled={task.status !== 'completed' || isDownloading[task.id]}
                >
                  {isDownloading[task.id] ? 'Downloading...' : 'Download'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 