import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Brain, FileText, Lightbulb, List, RotateCcw, Sparkles } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { FlashcardView } from "./FlashcardView";
import { QuizView } from "./QuizView";
import { SummaryView } from "./SummaryView";
import { useLearningMaterials } from "../hooks/useLearningMaterials";
import { Notification } from "@/components/ui/notification-toast";

export interface LearningMaterial {
  id: string;
  type: "flashcard" | "quiz" | "summary";
  content: any;
  title: string;
  dateCreated: Date;
}

export interface LearningMaterialsGeneratorProps {
  pdfId?: string;
  pdfContent?: string;
  pdfTitle?: string;
}

export function LearningMaterialsGenerator({ 
  pdfId, 
  pdfContent,
  pdfTitle = "Unnamed Document" 
}: LearningMaterialsGeneratorProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("flashcards");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const { 
    flashcards,
    quizzes,
    summaries,
    generateLearningMaterials,
    isLoading
  } = useLearningMaterials(pdfId);

  const handleGenerate = async () => {
    if (!pdfContent) {
      Notification.warning("No content available", {
        description: "Please load a PDF document first"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await generateLearningMaterials(pdfContent, pdfTitle);
      Notification.success("Learning materials generated", {
        description: "Your study materials are ready to use"
      });
    } catch (error) {
      console.error("Error generating learning materials:", error);
      Notification.error("Generation failed", {
        description: "Could not generate learning materials. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Theme-specific styling
  const getThemeClasses = () => {
    switch (theme) {
      case "matrix":
        return {
          iconClass: "matrix-text",
          cardClass: "border-primary/20",
          badgeVariant: "matrix" as const,
          highlightClass: "text-primary matrix-text",
        };
      case "synthwave":
        return {
          iconClass: "gradient-text",
          cardClass: "border-primary/40",
          badgeVariant: "synthwave" as const,
          highlightClass: "text-primary gradient-text",
        };
      case "cyberpunk":
        return {
          iconClass: "text-yellow-500",
          cardClass: "border-yellow-500/20",
          badgeVariant: "cyberpunk" as const,
          highlightClass: "text-yellow-500",
        };
      case "nord":
        return {
          iconClass: "text-blue-400",
          cardClass: "border-blue-400/20",
          badgeVariant: "nord" as const,
          highlightClass: "text-blue-400",
        };
      default:
        return {
          iconClass: "text-primary",
          cardClass: "",
          badgeVariant: "default" as const,
          highlightClass: "text-primary",
        };
    }
  };

  const themeClasses = getThemeClasses();

  const getTotalItemsCount = () => {
    return flashcards.length + quizzes.length + summaries.length;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Brain className={cn("size-6", themeClasses.iconClass)} />
            <span>AI Learning Materials</span>
          </h1>
          <p className="text-muted-foreground">
            Generate interactive study materials from translated documents
          </p>
        </div>
        
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || isLoading || !pdfContent}
          className="min-w-40"
        >
          {isGenerating ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Materials
            </>
          )}
        </Button>
      </div>

      {getTotalItemsCount() > 0 ? (
        <Card className={cn("mb-6", themeClasses.cardClass)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              Study Materials for "{pdfTitle}"
            </CardTitle>
            <CardDescription>
              Interact with AI-generated materials to enhance your learning
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="flashcards" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="flashcards" className="flex items-center gap-2">
                  <FileText className="size-4" />
                  <span className="hidden sm:inline">Flashcards</span>
                  <Badge variant={themeClasses.badgeVariant}>{flashcards.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="flex items-center gap-2">
                  <Lightbulb className="size-4" />
                  <span className="hidden sm:inline">Quizzes</span>
                  <Badge variant={themeClasses.badgeVariant}>{quizzes.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="summaries" className="flex items-center gap-2">
                  <List className="size-4" />
                  <span className="hidden sm:inline">Summaries</span>
                  <Badge variant={themeClasses.badgeVariant}>{summaries.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <Separator />
            
            <CardContent className="pt-6">
              <TabsContent value="flashcards" className="mt-0">
                <FlashcardView flashcards={flashcards} />
              </TabsContent>
              
              <TabsContent value="quizzes" className="mt-0">
                <QuizView quizzes={quizzes} />
              </TabsContent>
              
              <TabsContent value="summaries" className="mt-0">
                <SummaryView summaries={summaries} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : isLoading ? (
        <Card className="p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <RotateCcw className="size-8 text-primary animate-spin" />
            <h3 className="text-xl font-semibold">Loading learning materials...</h3>
            <p className="text-muted-foreground">Please wait while we prepare your study aids</p>
          </div>
        </Card>
      ) : (
        <Card className="p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <Book className={cn("size-12 opacity-80", themeClasses.iconClass)} />
            <h3 className="text-xl font-semibold">No learning materials yet</h3>
            <p className="text-muted-foreground">
              Generate interactive flashcards, quizzes, and summaries from your translated documents to enhance your learning experience.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
} 