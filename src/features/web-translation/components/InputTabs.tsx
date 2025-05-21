'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlInput } from './UrlInput';
import { TextareaInput } from './TextareaInput';
import { Globe, Code } from 'lucide-react';

interface InputTabsProps {
  onUrlSubmit: (url: string) => Promise<void>;
  onHtmlSubmit: (html: string) => void;
  disabled?: boolean;
}

export function InputTabs({ onUrlSubmit, onHtmlSubmit, disabled = false }: InputTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('url');

  return (
    <Tabs defaultValue="url" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>URL</span>
        </TabsTrigger>
        <TabsTrigger value="html" className="flex items-center space-x-2">
          <Code className="h-4 w-4" />
          <span>HTML</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="url" className="py-4">
        <UrlInput onSubmitUrl={onUrlSubmit} disabled={disabled} />
      </TabsContent>
      
      <TabsContent value="html" className="py-4">
        <TextareaInput onSubmitHtml={onHtmlSubmit} disabled={disabled} />
      </TabsContent>
    </Tabs>
  );
}