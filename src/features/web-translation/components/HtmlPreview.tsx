'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HtmlPreviewProps {
  html: string;
  title?: string;
  className?: string;
}

export function HtmlPreview({ html, title, className }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && html) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Apply DOCTYPE and write HTML
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title || 'Web Translation Preview'}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  line-height: 1.5;
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  width: 100%;
                }
                
                img, video {
                  max-width: 100%;
                  height: auto;
                }
                
                a {
                  pointer-events: none;
                  text-decoration: underline;
                  color: inherit;
                }
                
                button, input, select, textarea {
                  pointer-events: none;
                }
              </style>
            </head>
            <body>${html}</body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [html, title]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-md border", className)}>
      <iframe
        ref={iframeRef}
        title={title || "Web Preview"}
        className="h-full w-full"
        sandbox="allow-same-origin"
        loading="lazy" 
      />
    </div>
  );
}

interface SideBySidePreviewProps {
  originalHtml: string;
  translatedHtml: string | null;
  className?: string;
}

export function SideBySidePreview({ originalHtml, translatedHtml, className }: SideBySidePreviewProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", className)}>
      <div className="flex flex-col">
        <h3 className="mb-2 font-medium">Original</h3>
        <HtmlPreview 
          html={originalHtml} 
          title="Original Content" 
          className="h-[calc(100vh-300px)]" 
        />
      </div>
      
      <div className="flex flex-col">
        <h3 className="mb-2 font-medium">Translated</h3>
        {translatedHtml ? (
          <HtmlPreview 
            html={translatedHtml} 
            title="Translated Content" 
            className="h-[calc(100vh-300px)]" 
          />
        ) : (
          <div className="flex h-[calc(100vh-300px)] items-center justify-center rounded-md border bg-muted/20 px-4 py-8 text-center text-muted-foreground">
            Translation will appear here
          </div>
        )}
      </div>
    </div>
  );
} 