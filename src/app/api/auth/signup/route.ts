import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(req: Request) {
  try {
    const { name, email, password, groqApiKey } = await req.json();

    if (!name || !email || !password || !groqApiKey) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const lowercasedEmail = email.toLowerCase();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lowercasedEmail,
      password: password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        name: name,
        groq_api_key: groqApiKey,
      },
    });

    if (authError) {
      console.error('Supabase Auth creation error:', authError);
      
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { message: 'User already exists.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { message: authError.message || 'Failed to create user.' },
        { status: 400 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        { message: 'Failed to create user.' },
        { status: 500 }
      );
    }

    console.log('✅ User created successfully:', lowercasedEmail);

    return NextResponse.json(
      { message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}
