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

    // Get user ID from Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ history: [] });
    }

    const user = users.find(u => u.email?.toLowerCase() === session.user.email?.toLowerCase());

    if (!user) {
      console.error('User not found in Supabase Auth');
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
