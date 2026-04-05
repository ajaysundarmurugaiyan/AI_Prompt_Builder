import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { groqApiKey } = await req.json();

    if (!groqApiKey) {
      return NextResponse.json(
        { message: 'Missing API Key.' },
        { status: 400 }
      );
    }

    /**
     * Update the user's API key in Supabase using the administrative client.
     */
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ groq_api_key: groqApiKey })
      .eq('email', session.user.email);

    if (updateError) {
      console.error('Update API Key Error:', updateError);
      return NextResponse.json(
        { message: 'Database update failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'API Key updated successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update API Key Unexpected Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.', error: error.message },
      { status: 500 }
    );
  }
}
