import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    // Test Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      authWorking: !authError,
      authError: authError?.message,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
