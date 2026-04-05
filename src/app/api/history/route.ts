import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    /**
     * Fetch the 20 most recent prompt generations for the current user.
     * We join with the users table to ensure the user exists and matches.
     */
    const { data: history, error } = await supabaseAdmin
      .from('prompt_history')
      .select('*, users!inner(email)')
      .eq('users.email', session.user.email)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Fetch History Error:', error);
      throw error;
    }

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
