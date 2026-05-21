import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sbproject.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrbHZ3eGt2dnJvaWt4b29wYWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjYyMzMsImV4cCI6MjA4OTQwMjIzM30.BqHt0xCVZatrFzo7j-bZFmZH5OvGM0fQnovVnSJeVn0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);