
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoodEntry {
  date: string;
  mood: number;
  note?: string;
}

const moodLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
};

const HealthLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchMoodData = async () => {
      try {
        // Determine the date range based on selected period
        const now = new Date();
        let startDate = new Date();
        
        if (selectedPeriod === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (selectedPeriod === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          const formattedData: MoodEntry[] = data.map(entry => ({
            date: entry.date,
            mood: entry.mood,
            note: entry.note
          }));
          
          setMoodData(formattedData);
        }
      } catch (error) {
        console.error('Error loading mood data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load mood data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMoodData();
  }, [user, selectedPeriod, toast]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getChartData = () => {
    return moodData.map(entry => ({
      date: formatDate(entry.date),
      mood: entry.mood,
      moodLabel: moodLabels[entry.mood as keyof typeof moodLabels]
    }));
  };

  const getMoodAverage = (): number => {
    if (!moodData.length) return 0;
    const sum = moodData.reduce((acc, entry) => acc + entry.mood, 0);
    return parseFloat((sum / moodData.length).toFixed(1));
  };

  const getMoodTrend = (): string => {
    if (moodData.length < 3) return "Not enough data";
    
    const recent = moodData.slice(-3);
    const avg = recent.reduce((acc, entry) => acc + entry.mood, 0) / recent.length;
    const firstHalf = moodData.slice(0, Math.floor(moodData.length / 2));
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((acc, entry) => acc + entry.mood, 0) / firstHalf.length
      : 0;
    
    if (avg > firstHalfAvg + 0.5) return "Improving";
    if (avg < firstHalfAvg - 0.5) return "Declining";
    return "Stable";
  };

  const saveReport = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('health_reports')
        .insert({
          user_id: user.id,
          report_date: new Date().toISOString().split('T')[0],
          mood_average: getMoodAverage(),
          mood_trend: getMoodTrend(),
          notes: `Report generated for ${selectedPeriod} period with ${moodData.length} entries.`
        });
      
      if (error) throw error;
      
      toast({
        title: 'Report Saved',
        description: 'Your health report has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to save report',
        variant: 'destructive',
      });
    }
  };

  const downloadReport = () => {
    if (moodData.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no mood data to generate a report.',
        variant: 'destructive',
      });
      return;
    }
    
    const reportData = JSON.stringify({
      date: new Date().toISOString(),
      period: selectedPeriod,
      moodAverage: getMoodAverage(),
      moodTrend: getMoodTrend(),
      data: moodData
    }, null, 2);
    
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also save to database
    saveReport();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')} 
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-poppins font-semibold text-sage">Health Log & Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="card-mental">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-poppins flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sage" />
              Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((period) => (
                <Button 
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  className={selectedPeriod === period ? "bg-sage text-white" : ""}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-mental">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-poppins flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-lavender" />
              Mood Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold">{getMoodAverage()}</p>
                <p className="text-sm text-muted-foreground">out of 5</p>
              </div>
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                Trend: {getMoodTrend()}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-mental">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-poppins flex items-center gap-2">
              <Download className="h-5 w-5 text-peach" />
              Export Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              className="w-full"
              onClick={downloadReport}
              disabled={moodData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="card-mental mb-8">
        <CardHeader>
          <CardTitle className="font-poppins">Mood Tracking Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {moodData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="mood" stroke="#A78BC1" strokeWidth={2} />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[0, 5]} 
                    ticks={[1, 2, 3, 4, 5]} 
                    tickFormatter={(value) => moodLabels[value as keyof typeof moodLabels] || ''} 
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} - ${moodLabels[value as keyof typeof moodLabels]}`, 
                      'Mood'
                    ]} 
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center flex-col">
              <p className="text-lg text-muted-foreground mb-4">No mood data for this period</p>
              <Button 
                onClick={() => navigate('/journal')} 
                className="bg-sage hover:bg-sage/90"
              >
                Add Mood Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="card-mental mb-8">
        <CardHeader>
          <CardTitle className="font-poppins">Mood Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {moodData.length > 0 ? (
            <div className="space-y-4">
              {moodData.map((entry, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">{formatDate(entry.date)}</p>
                    <span className="px-3 py-1 bg-lavender/20 rounded-full text-sm">
                      {moodLabels[entry.mood as keyof typeof moodLabels]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.note || "No note added"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No mood entries in this period</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthLogPage;
