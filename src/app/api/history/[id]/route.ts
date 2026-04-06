import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'History ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { message: 'Error fetching user' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email?.toLowerCase() === session.user.email?.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch the specific history item
    const { data: historyItem, error } = await supabaseAdmin
      .from('prompt_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !historyItem) {
      console.error('Fetch History Detail Error:', error);
      return NextResponse.json(
        { message: 'History item not found' },
        { status: 404 }
      );
    }

    console.log('✅ Fetched history detail for user:', session.user.email, '- ID:', id);

    return NextResponse.json(historyItem);
  } catch (error: any) {
    console.error('History Detail API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
