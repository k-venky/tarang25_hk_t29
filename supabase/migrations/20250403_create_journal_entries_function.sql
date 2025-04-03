
-- Create RPC function to create journal_entries table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_journal_entries_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'journal_entries'
  ) THEN
    -- Create journal_entries table
    CREATE TABLE public.journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      content TEXT NOT NULL,
      mood TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

    -- Set up Row Level Security
    ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view their own journal entries" 
      ON public.journal_entries 
      FOR SELECT 
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own journal entries" 
      ON public.journal_entries 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own journal entries" 
      ON public.journal_entries 
      FOR UPDATE 
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own journal entries" 
      ON public.journal_entries 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END;
$$;
