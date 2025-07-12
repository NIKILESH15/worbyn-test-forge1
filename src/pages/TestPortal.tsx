import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const TestPortal = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('*')
        .eq('is_selected', true)
        .order('created_at', { ascending: true })
        .limit(25);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedQuestions: Question[] = data.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer
        }));
        setQuestions(formattedQuestions);
      } else {
        // Default questions if none are selected
        const defaultQuestions: Question[] = Array.from({length: 25}, (_, i) => ({
          id: `q${i + 1}`,
          question: `Sample Question ${i + 1}: This is a placeholder question for testing purposes.`,
          options: [
            'Option A - First choice',
            'Option B - Second choice',
            'Option C - Third choice',
            'Option D - Fourth choice'
          ],
          correctAnswer: 0
        }));
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions from database.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !showInstructions) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleEndTest();
    }
  }, [timeLeft, showInstructions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleEndTest = async () => {
    let score = 0;
questions.forEach((question, index) => {
  const userAnswer = answers[index];
  const correctAnswer = question.correctAnswer;

  console.log(`Q${index + 1}:`, {
    userAnswer,
    correctAnswer,
    matched:
      userAnswer?.toString().trim().toLowerCase() ===
      correctAnswer?.toString().trim().toLowerCase(),
  });

  if (
    userAnswer?.toString().trim().toLowerCase() ===
    correctAnswer?.toString().trim().toLowerCase()
  ) {
    score += 2;
  }
});


    try {
      // Save result to database
      const employee = JSON.parse(localStorage.getItem('currentEmployee') || '{}');

      // Get the next serial number
      const { data: countData, error: countError } = await supabase
        .from('employee_results')
        .select('serial_number')
        .order('serial_number', { ascending: false })
        .limit(1);

      if (countError) throw countError;

      const nextSerialNumber = countData && countData.length > 0
        ? countData[0].serial_number + 1
        : 1;

      const { error } = await supabase
        .from('employee_results')
        .insert({
          serial_number: nextSerialNumber,
          name: employee.name || '',
          gender: employee.gender || '',
          position: employee.position || '',
          total_marks: score
        });

      if (error) throw error;

      navigate('/thank-you');
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: "Failed to save test result.",
        variant: "destructive",
      });
    }
  };

  const instructionsList = [
    "Read each question carefully before selecting your answer.",
    "Each question carries 2 marks for a total of 50 marks.",
    "You have 30 minutes to complete all 25 questions.",
    "Once you start the test, the timer cannot be paused.",
    "You can change your answers before submitting the test.",
    "Ensure stable internet connection throughout the test.",
    "Do not refresh or close the browser during the test.",
    "Click 'End Test' only when you're ready to submit.",
    "No external help or resources are allowed during the test.",
    "Review your answers before final submission."
  ];

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Logo size="md" />
          <div className="text-right">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-sm font-bold text-lg">
              Time: {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Test Instructions
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {instructionsList.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-foreground">{instruction}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
            >
              Start Test Now
            </Button>
          </DialogContent>
        </Dialog>

        <Card className="shadow-elegant border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }}
              />

              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-sm border hover:bg-muted/50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between items-center pt-6">
                <Button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="rounded-sm"
                >
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleEndTest}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-sm"
                  >
                    End Test
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPortal;