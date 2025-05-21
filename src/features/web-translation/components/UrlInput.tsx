'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';

interface UrlInputProps {
  onSubmitUrl: (url: string) => Promise<void>;
  disabled?: boolean;
}

export function UrlInput({ onSubmitUrl, disabled = false }: UrlInputProps) {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      // Add https:// if not present
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`;
      }
      
      new URL(formattedUrl); // This will throw if URL is invalid
      
      setIsLoading(true);
      try {
        await onSubmitUrl(formattedUrl);
        toast.success('URL loaded successfully');
      } catch (error) {
        console.error('Error loading URL:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load URL');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
      <div className="relative flex-grow">
        <ExternalLink className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-9"
          disabled={disabled || isLoading}
        />
      </div>
      <Button type="submit" disabled={disabled || isLoading}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Load</span>
          </div>
        )}
      </Button>
    </form>
  );
} 