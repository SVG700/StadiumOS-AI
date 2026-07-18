import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Successful code exchange, redirect directly into Visitor Dashboard
        return NextResponse.redirect(`${origin}/dashboard/visitor`);
      }
      console.error('Supabase code exchange error:', error);
    } else {
      console.warn('Supabase not configured in callback handler, proceeding with fallback redirect');
      return NextResponse.redirect(`${origin}/dashboard/visitor`);
    }
  }

  // Return the user to the login page with a flag
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
