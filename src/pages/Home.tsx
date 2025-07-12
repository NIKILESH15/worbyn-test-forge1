import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-saffron flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="mb-8">
          <Logo size="xl" className="justify-center mb-4" />
          <h1 className="text-4xl font-bold text-primary-foreground font-heading mb-2">
            Employee Test Portal
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Welcome to Worbyn Assessment Platform
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/employee-form')}
            className="w-full h-14 text-lg font-semibold bg-card text-card-foreground hover:bg-card/90 shadow-elegant border-0 rounded-sm"
            size="lg"
          >
            Employee Test Page
          </Button>

          <Button
            onClick={() => navigate('/admin-login')}
            className="w-full h-14 text-lg font-semibold bg-gradient-dark text-primary-foreground hover:opacity-90 shadow-elegant border-0 rounded-sm"
            size="lg"
          >
            Admin Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;