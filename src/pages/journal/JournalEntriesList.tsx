
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood: string;
}

interface JournalEntriesListProps {
  entries: JournalEntry[];
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};

export const JournalEntriesList: React.FC<JournalEntriesListProps> = ({ entries }) => {
  return (
    <Card className="card-mental">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Previous Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">{formatDate(entry.date)}</p>
                  <span className="text-xs px-2 py-1 bg-lavender/20 rounded-full">{entry.mood}</span>
                </div>
                <p className="text-sm line-clamp-3">{entry.content}</p>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-full text-sage hover:text-sage/80 hover:bg-sage/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              View All Entries
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No entries yet</p>
        )}
      </CardContent>
    </Card>
  );
};
