
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, BarChart3, ArrowLeft, FileText } from 'lucide-react';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const chartRef = useRef<HTMLDivElement>(null);

  const downloadReport = () => {
    if (moodData.length === 0) {
      toast({
        title: 'No Data',
        description: 'There is no mood data to generate a report.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Add title and header information
      doc.setFontSize(20);
      doc.setTextColor(85, 133, 95); // sage color
      doc.text('CerebroSync Health Report', 105, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${today}`, 20, 30);
      doc.text(`Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`, 20, 40);
      doc.text(`Mood Average: ${getMoodAverage()} out of 5`, 20, 50);
      doc.text(`Trend: ${getMoodTrend()}`, 20, 60);

      // Add mood entries table
      const tableColumn = ["Date", "Mood", "Notes"];
      const tableRows = moodData.map(entry => [
        formatDate(entry.date),
        `${entry.mood} - ${moodLabels[entry.mood as keyof typeof moodLabels]}`,
        entry.note || "No note added"
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [167, 139, 193] }, // lavender color
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 70 }
      });

      // Add summary and recommendations
      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.text('Summary and Recommendations:', 20, finalY + 20);

      let recommendations = 'Based on your mood data:';
      if (getMoodAverage() < 2.5) {
        recommendations += '\n• Consider speaking with a mental health professional';
        recommendations += '\n• Practice daily self-care activities';
        recommendations += '\n• Try the breathing exercises in the app regularly';
      } else if (getMoodAverage() < 3.5) {
        recommendations += '\n• Continue monitoring your mood patterns';
        recommendations += '\n• Practice mindfulness and stress reduction techniques';
        recommendations += '\n• Maintain a regular sleep schedule';
      } else {
        recommendations += '\n• Keep up the good work!';
        recommendations += '\n• Continue your positive habits';
        recommendations += '\n• Share your strategies with others in the forum';
      }

      doc.setFontSize(10);
      doc.text(recommendations, 20, finalY + 30);

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text('CerebroSync - Mental Health Support for Students', 105, 285, { align: 'center' });
      }

      // Save the PDF
      doc.save(`cerebrosync-health-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Report Downloaded',
        description: 'Your health report has been downloaded as a PDF.',
      });

      // Also save to database
      saveReport();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    }
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
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadReport}
                disabled={moodData.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <p className="text-xs text-center text-muted-foreground">Download a comprehensive health report in PDF format</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-mental mb-8">
        <CardHeader>
          <CardTitle className="font-poppins">Mood Tracking Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {moodData.length > 0 ? (
            <div className="h-80" ref={chartRef}>
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
