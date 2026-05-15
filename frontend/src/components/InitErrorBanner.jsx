import { supabaseInitError } from "../lib/supabase";

export default function InitErrorBanner() {
  if (!supabaseInitError) return null;
  return (
    <div className="bg-red-600 text-white text-sm text-center px-3 py-2">
      ⚠️ {supabaseInitError}
    </div>
  );
}
