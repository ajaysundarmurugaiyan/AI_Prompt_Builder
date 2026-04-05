import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    // Check if user already exists in custom table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', lowercasedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists.' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth (for email functionality)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lowercasedEmail,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
      },
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return NextResponse.json(
        { message: 'Failed to create user account.' },
        { status: 500 }
      );
    }

    // Hash the password for custom table
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in custom users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id, // Use same ID as Supabase Auth
          name,
          email: lowercasedEmail,
          password_hash: hashedPassword,
          groq_api_key: groqApiKey,
        },
      ]);

    if (insertError) {
      // Rollback: delete from Supabase Auth if custom table insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw insertError;
    }

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
