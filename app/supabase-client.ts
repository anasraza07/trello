import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://sfewrzuevadvocorpctx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXdyenVldmFkdm9jb3JwY3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzE1MjYsImV4cCI6MjA4MTEwNzUyNn0.m2WeZ4-UhImrXQL_gaiN-sGSyAXJTePHhr4LGkBeizk"
)