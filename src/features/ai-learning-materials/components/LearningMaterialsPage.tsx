import { useState } from "react";
import { LearningMaterialsGenerator } from "../components/LearningMaterialsGenerator";
import { MainNav } from "@/components/layout/MainNav";
import { FileUploader } from "@/components/ui/file-uploader";
import { Button } from "@/components/ui/button";
import { Brain, File, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Notification } from "@/components/ui/notification-toast";

export function LearningMaterialsPage() {
  const [pdfContent, setPdfContent] = useState<string | undefined>();
  const [pdfTitle, setPdfTitle] = useState<string>("Unnamed Document");
  const [pdfId, setPdfId] = useState<string | undefined>();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Update PDF title based on filename (without extension)
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setPdfTitle(fileName);
    
    // Generate a unique ID for this document
    setPdfId(Date.now().toString());

    try {
      // In a real implementation, this would use a PDF parsing library
      // For now, we'll just simulate content extraction
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        // Simulating extracted text content
        const extractedText = `Sample content from ${fileName}. 
This is a placeholder for the actual extracted PDF text that would be processed by the AI 
to generate learning materials including flashcards, quizzes, and summaries.

The actual implementation would use a PDF parsing library to extract text content from the uploaded PDF file.
This text would then be processed by AI models to identify key concepts, generate quiz questions,
and create effective learning materials.`;
        
        setPdfContent(extractedText);
        
        Notification.success("PDF loaded successfully", {
          description: `${fileName} is ready for processing`
        });
      };
      
      reader.onerror = () => {
        Notification.error("Error reading file", {
          description: "Could not read the PDF file. Please try again."
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing PDF:", error);
      Notification.error("PDF processing failed", {
        description: "There was an error processing your PDF. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="size-8 text-primary" />
                AI Learning Materials
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate intelligent study materials from your PDF documents
              </p>
            </div>
          </div>
          
          {!pdfContent ? (
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="max-w-md mx-auto">
                  <FileUploader
                    accept=".pdf"
                    maxSize={10 * 1024 * 1024} // 10MB
                    onFilesSelected={handleFileUpload}
                    icon={<Upload className="size-10 text-primary/60" />}
                    title="Upload a PDF document"
                    subtitle="Drag and drop a PDF, or click to browse"
                  />
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      PDF files up to 10MB are supported
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center border rounded-lg p-3 bg-muted/40">
                <div className="flex items-center gap-2">
                  <File className="size-5 text-primary" />
                  <span className="font-medium">{pdfTitle}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPdfContent(undefined);
                    setPdfTitle("Unnamed Document");
                    setPdfId(undefined);
                  }}
                >
                  Change document
                </Button>
              </div>
              
              <LearningMaterialsGenerator 
                pdfId={pdfId}
                pdfContent={pdfContent}
                pdfTitle={pdfTitle}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
} 