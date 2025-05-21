import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Mock function to simulate AI API call
const mockGenerateWithAI = async (content: string, title: string): Promise<any> => {
  console.log(`Generating learning materials for ${title}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock data sample for demonstration
  return {
    flashcards: [
      {
        id: uuidv4(),
        front: "What is the primary function of the mitochondria?",
        back: "The primary function of mitochondria is to generate energy for the cell through cellular respiration, producing ATP.",
        tags: ["biology", "cell", "energy"]
      },
      {
        id: uuidv4(),
        front: "Who wrote 'Pride and Prejudice'?",
        back: "Jane Austen wrote 'Pride and Prejudice', which was published in 1813.",
        tags: ["literature", "english", "novel"]
      },
      {
        id: uuidv4(),
        front: "What is the Pythagorean theorem?",
        back: "The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c².",
        tags: ["mathematics", "geometry", "theorem"]
      }
    ],
    quizzes: [
      {
        id: uuidv4(),
        title: "Basic Science Concepts",
        questions: [
          {
            id: uuidv4(),
            question: "Which of the following is NOT a renewable energy source?",
            options: [
              "Solar power",
              "Wind power",
              "Nuclear power",
              "Hydroelectric power"
            ],
            correctOption: 2,
            explanation: "Nuclear power relies on uranium, which is a finite resource, making it non-renewable."
          },
          {
            id: uuidv4(),
            question: "What is photosynthesis?",
            options: [
              "The process by which plants produce energy using light",
              "The process by which animals digest food",
              "The process of water evaporating from leaves",
              "The breakdown of glucose in cells"
            ],
            correctOption: 0,
            explanation: "Photosynthesis is the process by which green plants use sunlight to synthesize foods."
          }
        ]
      }
    ],
    summaries: [
      {
        id: uuidv4(),
        title: "Chapter Summary: Introduction to Cellular Biology",
        description: "Key concepts and structures in cellular biology from Chapter 1",
        sections: [
          {
            id: uuidv4(),
            title: "Cell Structure and Organization",
            content: "The cell is the basic structural and functional unit of all living organisms. Cells are enclosed by a plasma membrane and contain cytoplasm, genetic material, and various organelles.",
            keyPoints: [
              {
                id: uuidv4(),
                content: "All living organisms are composed of cells, the basic structural unit of life.",
                importance: "high"
              },
              {
                id: uuidv4(),
                content: "Eukaryotic cells contain membrane-bound organelles including the nucleus.",
                importance: "high"
              },
              {
                id: uuidv4(),
                content: "Prokaryotic cells lack membrane-bound organelles.",
                importance: "medium"
              }
            ]
          },
          {
            id: uuidv4(),
            title: "Cell Membrane Function",
            content: "The cell membrane serves as a selective barrier that regulates what enters and exits the cell. It is composed primarily of a phospholipid bilayer with embedded proteins.",
            keyPoints: [
              {
                id: uuidv4(),
                content: "The cell membrane regulates what enters and exits the cell through selective permeability.",
                importance: "high"
              },
              {
                id: uuidv4(),
                content: "The membrane is composed of a phospholipid bilayer with embedded proteins.",
                importance: "medium"
              }
            ]
          }
        ]
      }
    ]
  };
};

export function useLearningMaterials(pdfId?: string) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate learning materials from PDF content
  const generateLearningMaterials = async (content: string, title: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, call an AI service API
      const generatedData = await mockGenerateWithAI(content, title);
      
      // Update state with generated materials
      setFlashcards(generatedData.flashcards);
      setQuizzes(generatedData.quizzes);
      setSummaries(generatedData.summaries);
      
      return generatedData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate materials');
      setError(error);
      console.error('Error generating learning materials:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flashcards,
    quizzes,
    summaries,
    isLoading,
    error,
    generateLearningMaterials
  };
} 