
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const moods = [
  { emoji: '😊', label: 'Happy', value: 5, color: 'bg-green-100 dark:bg-green-900/30' },
  { emoji: '😌', label: 'Calm', value: 4, color: 'bg-blue-100 dark:bg-blue-900/30' },
  { emoji: '😐', label: 'Neutral', value: 3, color: 'bg-gray-100 dark:bg-gray-700/30' },
  { emoji: '😢', label: 'Sad', value: 2, color: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { emoji: '😡', label: 'Angry', value: 1, color: 'bg-orange-100 dark:bg-orange-900/30' },
  { emoji: '😰', label: 'Anxious', value: 1, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
];

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleMoodSelect = async (mood: string, moodValue: number) => {
    try {
      // Set the selected mood immediately for UI feedback
      setSelectedMood(mood);

      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please log in to save your mood.",
          variant: "destructive"
        });
        return;
      }

      // Show loading feedback
      toast({
        title: "Saving...",
        description: "Recording your mood",
      });

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if a mood has already been logged today
      const { data: existingEntry, error: fetchError } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw fetchError;
      }

      // Update existing entry or insert new one
      if (existingEntry) {
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update({
            mood: moodValue,
            note: `Feeling ${mood.toLowerCase()}` // Add a default note
          })
          .eq('id', existingEntry.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            date: today,
            mood: moodValue,
            note: `Feeling ${mood.toLowerCase()}` // Add a default note
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Mood Logged",
        description: `You're feeling ${mood.toLowerCase()} today.`,
      });
    } catch (error: any) {
      console.error('Error logging mood:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to save your mood';

      if (error.message) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'User profile not found. Please try logging out and back in.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Mood already recorded for today. Try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="card-mental mb-6">
      <h2 className="text-lg font-poppins font-semibold mb-3">How are you feeling today?</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.label}
            variant="ghost"
            className={`flex flex-col items-center p-3 h-auto ${
              selectedMood === mood.label ? 'ring-2 ring-sage' : ''
            } ${mood.color}`}
            onClick={() => handleMoodSelect(mood.label, mood.value)}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
