
import React, { useEffect, useState } from 'react';
import MoodTracker from '@/components/shared/MoodTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, BookOpen, Wind, Users, LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<{ display_name?: string } | null>(null);
  
  const quickAccessItems = [
    {
      title: 'Chat Support',
      description: "Talk with our AI assistant about how you're feeling.",
      icon: <MessageCircle className="h-6 w-6 text-lavender" />,
      path: '/chat'
    },
    {
      title: 'Breathing Exercises',
      description: 'Guided breathing to help you relax and focus.',
      icon: <Wind className="h-6 w-6 text-sage" />,
      path: '/breathing'
    },
    {
      title: 'Journal',
      description: 'Write down your thoughts and track your progress.',
      icon: <BookOpen className="h-6 w-6 text-peach" />,
      path: '/journal'
    },
    {
      title: 'Support Forums',
      description: "Connect with others who understand what you're going through.",
      icon: <Users className="h-6 w-6 text-lavender" />,
      path: '/forum'
    }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${userProfile?.display_name || 'there'}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-poppins font-semibold mb-6 text-sage">
          {user ? getGreeting() : 'Welcome to CerebroSync'}
        </h1>
        
        {user ? (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 mb-6" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 mb-6"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
      </div>
      
      <MoodTracker />
      
      <section className="mb-8">
        <h2 className="text-xl font-poppins font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessItems.map((item) => (
            <Card key={item.title} className="card-mental hover:shadow-md cursor-pointer transition-all duration-200" onClick={() => navigate(item.path)}>
              <CardHeader className={`pb-2 ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <CardTitle className="text-lg font-poppins">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <Card className="card-mental bg-gradient-to-r from-sage/20 to-lavender/20">
          <CardContent className={`${isMobile ? 'p-5' : 'pt-6 p-6'}`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-poppins font-semibold mb-2">Daily Wellness Tip</h3>
                <p className="mb-4">Remember that it's okay to take breaks. Small moments of rest can help your mind recharge and improve your focus.</p>
                <Button className="bg-peach text-charcoal hover:bg-peach/90 w-full md:w-auto">Get More Tips</Button>
              </div>
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-lavender to-sage/70 flex items-center justify-center mt-4 md:mt-0">
                <span className="text-4xl md:text-5xl">🌱</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-8">
        <Card className="card-mental">
          <CardHeader>
            <CardTitle className="text-lg font-poppins flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sage"></span>
              Health Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">View your mood patterns and health logs over time.</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/health-log')}>
              View Health Report
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
