import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Users, LogOut } from 'lucide-react';
import Logo from '@/components/ui/logo';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Logo size="lg" />
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage test questions and view employee results
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-elegant border-0 cursor-pointer hover:shadow-glow transition-all"
                onClick={() => navigate('/mcq-questions')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary p-4 rounded-sm">
                  <FileQuestion className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                MCQ Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Add, edit, and manage multiple choice questions for the test. 
                Upload images and organize question banks.
              </p>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm">
                Manage Questions
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 cursor-pointer hover:shadow-glow transition-all"
                onClick={() => navigate('/employee-results')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-accent p-4 rounded-sm">
                  <Users className="w-8 h-8 text-accent-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Employee Results
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                View test results, scores, and performance analytics. 
                Export data to Excel for further analysis.
              </p>
              <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-sm">
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;