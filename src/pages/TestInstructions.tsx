import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';

const TestInstructions = () => {
  const navigate = useNavigate();

  const instructions = [
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

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Test Instructions
            </CardTitle>
            <p className="text-muted-foreground">
              Please read all instructions carefully before starting
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-8">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-foreground">{instruction}</p>
                </div>
              ))}
            </div>

            <div className="bg-accent/20 p-4 rounded-sm mb-6">
              <h3 className="font-semibold text-foreground mb-2">Test Details:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Total Questions: 25</li>
                <li>• Total Marks: 50 (2 marks per question)</li>
                <li>• Time Duration: 30 minutes</li>
                <li>• Question Type: Multiple Choice Questions (MCQ)</li>
              </ul>
            </div>

            <Button 
              onClick={() => navigate('/test-portal')}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestInstructions;