'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface TextareaInputProps {
  onSubmitHtml: (html: string) => void;
  disabled?: boolean;
}

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Sample Article for Translation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .highlight { background-color: #ffffcc; padding: 5px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <h1>Understanding Artificial Intelligence</h1>
    <p>Published on <time>May 15, 2024</time> by John Doe</p>
  </header>
  
  <main>
    <p>Artificial Intelligence (AI) is transforming how we live and work. From voice assistants to recommendation systems, AI technologies are becoming increasingly integrated into our daily lives.</p>
    
    <h2>What is AI?</h2>
    <p>AI refers to computer systems designed to perform tasks that typically require human intelligence. These tasks include:</p>
    <ul>
      <li>Learning from experience</li>
      <li>Recognizing patterns</li>
      <li>Making decisions</li>
      <li>Understanding natural language</li>
    </ul>
    
    <p class="highlight">The field of AI has seen rapid advancement in recent years, particularly in the areas of machine learning and neural networks.</p>
    
    <h2>Types of AI</h2>
    <p>AI can be categorized into two main types:</p>
    <ol>
      <li><strong>Narrow AI</strong>: Systems designed for specific tasks</li>
      <li><strong>General AI</strong>: Systems with human-like cognitive abilities</li>
    </ol>
    
    <p>While narrow AI is common today, general AI remains largely theoretical.</p>
  </main>
  
  <footer>
    <p>© 2024 AI Educational Resources</p>
  </footer>
</body>
</html>
`;

export function TextareaInput({ onSubmitHtml, disabled = false }: TextareaInputProps) {
  const [html, setHtml] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!html.trim()) {
      toast.error('Please enter HTML content');
      return;
    }

    try {
      onSubmitHtml(html);
      toast.success('HTML content loaded');
    } catch (error) {
      console.error('Error loading HTML:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load HTML');
    }
  };

  const loadSample = () => {
    setHtml(SAMPLE_HTML);
    toast.info('Sample HTML loaded. Submit to translate.');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Enter HTML Content</span>
        </div>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={loadSample}
          disabled={disabled}
          className="text-xs flex items-center gap-1"
        >
          <FileText className="h-3 w-3" />
          Load Sample
        </Button>
      </div>
      
      <Textarea
        placeholder="Paste HTML content here..."
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
        disabled={disabled}
      />
      
      <Button type="submit" className="self-end" disabled={disabled}>
        <Check className="mr-2 h-4 w-4" />
        Load HTML
      </Button>
    </form>
  );
} 