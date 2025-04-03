
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client.ts'

// Create journal_entries table if it doesn't exist
async function initializeDatabase() {
  try {
    await supabase.rpc('create_journal_entries_table');
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database and then render the app
initializeDatabase().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
