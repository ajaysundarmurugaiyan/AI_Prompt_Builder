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

    // First, get the user ID from the email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json({ history: [] });
    }

    // Fetch the 20 most recent prompt generations for the current user
    const { data: history, error } = await supabaseAdmin
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Fetch History Error:', error);
      return NextResponse.json({ history: [] });
    }

    console.log('✅ Fetched history for user:', session.user.email, '- Count:', history?.length || 0);

    return NextResponse.json({ history: history || [] });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
