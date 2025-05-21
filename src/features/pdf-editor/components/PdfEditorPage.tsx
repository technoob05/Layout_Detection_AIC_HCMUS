import { PdfEditor } from './PdfEditor';
import { cn } from '@/lib/utils';

export function PdfEditorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                PDF Editor & Translator
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={cn("flex-1 w-full flex")}>
          <PdfEditor />
        </div>
      </main>
    </div>
  );
} 