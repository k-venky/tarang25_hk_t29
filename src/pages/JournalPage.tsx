
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { JournalEntryForm } from './journal/JournalEntryForm';
import { JournalEntriesList } from './journal/JournalEntriesList';

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood: string;
}

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchJournalEntries = () => {
      try {
        // Get entries from localStorage
        const storedEntries = localStorage.getItem(`journal_entries_${user.id}`);

        if (storedEntries) {
          const parsedEntries = JSON.parse(storedEntries);
          const formattedEntries: JournalEntry[] = parsedEntries.map((entry: any) => ({
            id: entry.id,
            date: new Date(entry.date),
            content: entry.content,
            mood: entry.mood || 'Unspecified'
          }));

          // Sort by date descending
          formattedEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

          setEntries(formattedEntries);
        }
      } catch (error) {
        console.error('Error loading journal entries from localStorage:', error);
        toast({
          title: 'Error',
          description: 'Failed to load journal entries',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalEntries();
  }, [user, toast]);

  const handleEntrySave = (newEntry: JournalEntry) => {
    // Add the new entry to the state
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    // Save to localStorage if user is logged in
    if (user) {
      try {
        localStorage.setItem(
          `journal_entries_${user.id}`,
          JSON.stringify(updatedEntries.map(entry => ({
            ...entry,
            date: entry.date.toISOString() // Convert Date to string for storage
          })))
        );
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        toast({
          title: 'Warning',
          description: 'Entry saved locally but may not persist after browser close',
          variant: 'destructive',
        });
      }
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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-poppins font-semibold mb-6 text-sage">Journal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JournalEntryForm onEntrySave={handleEntrySave} />
        </div>

        <div>
          <JournalEntriesList entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
