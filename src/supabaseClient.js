// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sbproject.supabase.co"; // your actual Supabase project URL
const SUPABASE_ANON_KEY = "sb_publishable_OvDPktRgWmXYWjK-jpQBsQ_ESln-mgD";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);