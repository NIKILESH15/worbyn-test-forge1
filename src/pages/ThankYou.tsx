import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Logo from '@/components/ui/logo';

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-saffron flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
        </div>

        <Card className="shadow-elegant border-0 text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Thank You!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Your test has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                We will review your responses and contact you regarding the results. 
                Thank you for taking the time to complete the assessment.
              </p>

              <div className="pt-6">
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;