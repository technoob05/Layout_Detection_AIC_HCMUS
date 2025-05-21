import { useState, useMemo } from 'react';
import { Annotation } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// Icons
import {
  HighlighterIcon,
  UnderlineIcon,
  StrikethroughIcon,
  TypeIcon,
  PencilIcon,
  SquareIcon,
  CircleIcon,
  ArrowUpRight,
  Languages,
  X,
  Edit,
  Save,
  Trash2,
  Search,
  ImageIcon,
  SlidersHorizontal
} from 'lucide-react';

// Helper function to get annotation icon by type
const getAnnotationIcon = (type: string) => {
  switch (type) {
    case 'highlight':
      return <HighlighterIcon className="size-4" />;
    case 'underline':
      return <UnderlineIcon className="size-4" />;
    case 'strikethrough':
      return <StrikethroughIcon className="size-4" />;
    case 'text':
      return <TypeIcon className="size-4" />;
    case 'drawing':
      return <PencilIcon className="size-4" />;
    case 'rectangle':
      return <SquareIcon className="size-4" />;
    case 'ellipse':
      return <CircleIcon className="size-4" />;
    case 'arrow':
      return <ArrowUpRight className="size-4" />;
    case 'translation':
      return <Languages className="size-4" />;
    default:
      return <ImageIcon className="size-4" />;
  }
};

// Helper function to get annotation label by type
const getAnnotationLabel = (type: string) => {
  switch (type) {
    case 'highlight':
      return 'Highlight';
    case 'underline':
      return 'Underline';
    case 'strikethrough':
      return 'Strikethrough';
    case 'text':
      return 'Text Note';
    case 'drawing':
      return 'Drawing';
    case 'rectangle':
      return 'Rectangle';
    case 'ellipse':
      return 'Ellipse';
    case 'arrow':
      return 'Arrow';
    case 'translation':
      return 'Translation';
    default:
      return 'Annotation';
  }
};

// Format date helper
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface AnnotationsSidebarProps {
  annotations: Annotation[];
  currentPage: number;
  selectedAnnotation: Annotation | null;
  isTranslating: boolean;
  currentTranslationId: string | null;
  onSelectAnnotation: (annotation: Annotation | null) => void;
  onUpdateAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onTranslateAnnotation: (annotation: Annotation) => Promise<void>;
}

export function AnnotationsSidebar({
  annotations,
  currentPage,
  selectedAnnotation,
  isTranslating,
  currentTranslationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onTranslateAnnotation
}: AnnotationsSidebarProps) {
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  
  // Group annotations by page
  const annotationsByPage = annotations.reduce<Record<number, Annotation[]>>((acc, annotation) => {
    const page = annotation.pageNumber;
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(annotation);
    return acc;
  }, {});
  
  // Get current page annotations
  const currentPageAnnotations = annotationsByPage[currentPage] || [];
  
  const handleEditStart = (annotation: Annotation) => {
    setEditingAnnotation(annotation.id);
    setEditContent(annotation.content || '');
  };
  
  const handleEditSave = (annotation: Annotation) => {
    onUpdateAnnotation({
      ...annotation,
      content: editContent
    });
    setEditingAnnotation(null);
  };
  
  const handleEditCancel = () => {
    setEditingAnnotation(null);
  };
  
  return (
    <div className="fixed top-0 right-0 h-full w-[320px] bg-card border-l shadow-md flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Annotations</h3>
      </div>
      
      <Tabs defaultValue="current" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="current">Current Page</TabsTrigger>
          <TabsTrigger value="all">All Pages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            {currentPageAnnotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No annotations on this page
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {currentPageAnnotations.map((annotation) => (
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={selectedAnnotation?.id === annotation.id}
                    isEditing={editingAnnotation === annotation.id}
                    isTranslating={isTranslating && currentTranslationId === annotation.id}
                    editContent={editContent}
                    onSelect={() => onSelectAnnotation(annotation)}
                    onEditStart={() => handleEditStart(annotation)}
                    onEditSave={() => handleEditSave(annotation)}
                    onEditCancel={handleEditCancel}
                    onEditContentChange={setEditContent}
                    onDelete={() => onDeleteAnnotation(annotation.id)}
                    onTranslate={() => onTranslateAnnotation(annotation)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="all" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            {annotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No annotations in this document
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {Object.entries(annotationsByPage).map(([pageNum, pageAnnotations]) => (
                  <div key={pageNum}>
                    <h4 className="text-sm font-medium mb-2 sticky top-0 bg-card py-1">
                      Page {pageNum} ({pageAnnotations.length})
                    </h4>
                    <div className="space-y-2">
                      {pageAnnotations.map((annotation) => (
                        <AnnotationCard
                          key={annotation.id}
                          annotation={annotation}
                          isSelected={selectedAnnotation?.id === annotation.id}
                          isEditing={editingAnnotation === annotation.id}
                          isTranslating={isTranslating && currentTranslationId === annotation.id}
                          editContent={editContent}
                          onSelect={() => onSelectAnnotation(annotation)}
                          onEditStart={() => handleEditStart(annotation)}
                          onEditSave={() => handleEditSave(annotation)}
                          onEditCancel={handleEditCancel}
                          onEditContentChange={setEditContent}
                          onDelete={() => onDeleteAnnotation(annotation.id)}
                          onTranslate={() => onTranslateAnnotation(annotation)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AnnotationCardProps {
  annotation: Annotation;
  isSelected: boolean;
  isEditing: boolean;
  isTranslating: boolean;
  editContent: string;
  onSelect: () => void;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditContentChange: (content: string) => void;
  onDelete: () => void;
  onTranslate: () => void;
}

function AnnotationCard({
  annotation,
  isSelected,
  isEditing,
  isTranslating,
  editContent,
  onSelect,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditContentChange,
  onDelete,
  onTranslate
}: AnnotationCardProps) {
  const canEdit = ['text', 'highlight', 'underline', 'strikethrough'].includes(annotation.type);
  const canTranslate = Boolean(annotation.content) && ['highlight', 'underline', 'strikethrough', 'text'].includes(annotation.type);
  
  return (
    <Card 
      className={cn(
        "p-3 text-sm",
        isSelected && "ring-1 ring-primary",
        isTranslating && "opacity-70"
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">
            {getAnnotationIcon(annotation.type)}
          </span>
          <span className="font-medium">
            {getAnnotationLabel(annotation.type)}
          </span>
        </div>
        
        <div className="flex gap-1">
          {canEdit && !isEditing && (
            <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { 
              e.stopPropagation(); 
              onEditStart(); 
            }}>
              <Edit className="size-3" />
            </Button>
          )}
          
          {canTranslate && !isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-6" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onTranslate(); 
              }}
              disabled={isTranslating}
            >
              <Languages className="size-3" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="size-6 text-destructive" onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(); 
          }}>
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      
      {annotation.content && !isEditing && (
        <div className="mb-2 whitespace-pre-wrap break-words">
          {annotation.content}
        </div>
      )}
      
      {isEditing && (
        <div className="mb-2">
          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="resize-none mb-2"
            rows={3}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onEditCancel(); 
              }}
            >
              <X className="size-3 mr-1" /> Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onEditSave(); 
              }}
            >
              <Save className="size-3 mr-1" /> Save
            </Button>
          </div>
        </div>
      )}
      
      {annotation.translatedContent && (
        <div className="mb-2">
          <Badge className="mb-1">Translation</Badge>
          <div className="whitespace-pre-wrap break-words">
            {annotation.translatedContent}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {formatDate(new Date(annotation.updatedAt))}
      </div>
    </Card>
  );
} 