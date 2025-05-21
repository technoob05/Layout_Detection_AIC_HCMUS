import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/providers/theme-provider';
import { Progress } from '@/components/ui/progress';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizViewProps {
  quizzes: Quiz[];
}

export function QuizView({ quizzes }: QuizViewProps) {
  const { theme } = useTheme();
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Handle empty quizzes array
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quizzes available yet. Generate materials to create quizzes.</p>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctOption) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleChangeQuiz = (index: number) => {
    setCurrentQuizIndex(index);
    handleRestartQuiz();
  };

  // Get theme-specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return {
          correctClass: 'text-green-400 matrix-text',
          incorrectClass: 'text-red-400',
          badgeVariant: 'matrix' as const
        };
      case 'synthwave':
        return {
          correctClass: 'text-green-300 gradient-text',
          incorrectClass: 'text-red-300',
          badgeVariant: 'synthwave' as const
        };
      case 'cyberpunk':
        return {
          correctClass: 'text-yellow-400',
          incorrectClass: 'text-red-500',
          badgeVariant: 'cyberpunk' as const
        };
      case 'nord':
        return {
          correctClass: 'text-blue-300',
          incorrectClass: 'text-red-300',
          badgeVariant: 'nord' as const
        };
      default:
        return {
          correctClass: 'text-green-600',
          incorrectClass: 'text-red-600',
          badgeVariant: 'default' as const
        };
    }
  };

  const themeClasses = getThemeClasses();
  
  const progressPercentage = quizCompleted 
    ? 100 
    : Math.round(((currentQuestionIndex) / currentQuiz.questions.length) * 100);

  // Quiz selection buttons
  const renderQuizSelectors = () => {
    if (quizzes.length <= 1) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Available Quizzes:</h3>
        <div className="flex flex-wrap gap-2">
          {quizzes.map((quiz, index) => (
            <Button
              key={quiz.id}
              size="sm"
              variant={currentQuizIndex === index ? "default" : "outline"}
              onClick={() => handleChangeQuiz(index)}
            >
              {quiz.title || `Quiz ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Quiz completion view
  if (quizCompleted) {
    const scorePercentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    return (
      <div className="flex flex-col items-center py-4">
        {renderQuizSelectors()}
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Quiz Completed!</CardTitle>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Your Score</span>
                <span className="font-medium">{score}/{currentQuiz.questions.length} ({scorePercentage}%)</span>
              </div>
              <Progress value={scorePercentage} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2">
              {scorePercentage >= 80 ? (
                <Badge variant="success" className="text-sm px-3 py-1">
                  Excellent
                </Badge>
              ) : scorePercentage >= 60 ? (
                <Badge variant={themeClasses.badgeVariant} className="text-sm px-3 py-1">
                  Good
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  Needs Practice
                </Badge>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button onClick={handleRestartQuiz} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Restart Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Quiz question view
  return (
    <div className="flex flex-col">
      {renderQuizSelectors()}
      
      <div className="mb-4 flex justify-between items-center">
        <Badge variant={themeClasses.badgeVariant} className="px-2 py-1 text-xs">
          Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
        </Badge>
        <div className="text-sm text-muted-foreground">
          Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
        </div>
      </div>
      
      <Progress value={progressPercentage} className="mb-6 h-1" />
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <HelpCircle className="size-5 flex-shrink-0 mt-0.5 text-primary" />
            <CardTitle className="text-lg font-medium">{currentQuestion.question}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <RadioGroup 
            value={selectedOption?.toString()} 
            onValueChange={(value) => handleOptionSelect(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-start space-x-2 rounded-md border p-3 transition-colors",
                  selectedOption === index && !isAnswered && "border-primary bg-primary/5",
                  isAnswered && index === currentQuestion.correctOption && "border-green-500 bg-green-500/5",
                  isAnswered && selectedOption === index && index !== currentQuestion.correctOption && "border-red-500 bg-red-500/5"
                )}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`} 
                  className="mt-1"
                  disabled={isAnswered}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex items-center gap-2",
                      isAnswered && index === currentQuestion.correctOption && themeClasses.correctClass,
                      isAnswered && selectedOption === index && index !== currentQuestion.correctOption && themeClasses.incorrectClass
                    )}
                  >
                    {option}
                    {isAnswered && index === currentQuestion.correctOption && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {isAnswered && selectedOption === index && index !== currentQuestion.correctOption && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          {isAnswered && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          {!isAnswered ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedOption === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 