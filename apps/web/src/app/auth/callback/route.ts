import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@srmall/database';
import { getBaseUrl } from '@/utils/get-base-url';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = await getBaseUrl();

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${origin}/unauthorized?error=MissingSupabaseCredentials`);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      const email = data?.session?.user?.email;
      
      if (!email) {
        return NextResponse.redirect(`${origin}/unauthorized`);
      }

      // ─── User Data Lookup ───
      // Look up if user exists in our DB to determine role and tenant status
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      // 1. Admin Check
      if (email === 'jerickaradilla76@gmail.com' || dbUser?.role === 'ADMIN') {
        return NextResponse.redirect(`${origin}/admindashboard/tenant-monitoring`);
      }

      // 2. Tenant Check
      if (dbUser?.tenant) {
        return NextResponse.redirect(`${origin}/tenantdashboard`);
      }

      // 3. Customer Fallback
      // If user exists but is just a customer, or if they don't exist yet (will be created on first login in AuthProvider)
      return NextResponse.redirect(`${origin}/public-view`);
      
    } catch (err: any) {
      console.error('Auth Callback Critical Error:', err);
      const errorMessage = err?.message || 'Unknown error';
      return NextResponse.redirect(`${origin}/unauthorized?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  // Return to home if no code
  return NextResponse.redirect(origin);
}
