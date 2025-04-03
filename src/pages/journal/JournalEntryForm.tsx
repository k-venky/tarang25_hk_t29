
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { JOURNAL_PROMPTS, MOOD_OPTIONS } from './constants';

interface JournalEntryFormProps {
  onEntrySave: (entry: any) => void;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onEntrySave }) => {
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setCurrentEntry(currentEntry ? currentEntry + '\n\n' + prompt + '\n' : prompt + '\n');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your journal entry.",
        variant: "destructive"
      });
      return;
    }

    if (!currentEntry.trim()) {
      toast({
        title: "Entry empty",
        description: "Please write something before saving.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMood) {
      toast({
        title: "Mood not selected",
        description: "Please select how you're feeling today.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    const newEntry = {
      id: uuidv4(),
      date: new Date(),
      content: currentEntry,
      mood: selectedMood
    };

    try {
      // Show saving feedback
      toast({
        title: "Saving...",
        description: "Recording your journal entry",
      });

      // Pass the entry to the parent component to handle saving
      onEntrySave(newEntry);

      // Clear the form
      setCurrentEntry('');
      setSelectedPrompt('');
      setSelectedMood('');

      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been recorded locally."
      });
    } catch (error: any) {
      console.error('Error saving journal entry:', error);

      toast({
        title: 'Error',
        description: 'Failed to save journal entry locally',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="card-mental mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-sage" />
          New Entry - {formatDate(new Date())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">How are you feeling?</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <Button
                key={mood}
                variant="outline"
                size="sm"
                className={`${selectedMood === mood ? 'bg-sage text-white' : ''}`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Writing Prompts</label>
          <div className="flex flex-wrap gap-2">
            {JOURNAL_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className={`${selectedPrompt === prompt ? 'bg-lavender/50' : ''}`}
                onClick={() => handlePromptSelect(prompt)}
              >
                {prompt.length > 25 ? prompt.substring(0, 22) + '...' : prompt}
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="What's on your mind today?"
          className="min-h-[200px] mb-4"
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
        />

        <div className="flex gap-3">
          <Button
            className="bg-sage hover:bg-sage/90 flex-1 sm:flex-none"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
