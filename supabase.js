// Initialize Supabase client
// Replace with your Supabase project details
const SUPABASE_URL = "https://achartarfibykqfwcucu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaGFydGFyZmlieWtxZndjdWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjMxNTAsImV4cCI6MjA3MzY5OTE1MH0.IeNHDsbQ0rVoF0CcsTf1PpxUdwe5Y32A3YW7N3z3A6M";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);