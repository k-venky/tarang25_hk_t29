
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
    
    const fetchJournalEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const formattedEntries: JournalEntry[] = data.map(entry => ({
            id: entry.id,
            date: new Date(entry.date),
            content: entry.content,
            mood: entry.mood || 'Unspecified'
          }));
          
          setEntries(formattedEntries);
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load journal entries',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const createJournalTable = async () => {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .select('id')
          .limit(1);
          
        if (error) {
          const { error: sqlError } = await supabase.rpc('create_journal_entries_table');
          if (sqlError) throw sqlError;
        }
        
        fetchJournalEntries();
      } catch (error) {
        console.error('Error checking/creating journal table:', error);
        setIsLoading(false);
      }
    };
    
    createJournalTable();
  }, [user, toast]);

  const handleEntrySave = (newEntry: JournalEntry) => {
    setEntries([newEntry, ...entries]);
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
