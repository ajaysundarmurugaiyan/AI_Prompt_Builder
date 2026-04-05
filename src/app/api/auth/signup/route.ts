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

    // Hash the password for custom table
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to create user in Supabase Auth first (for email functionality)
    let authUserId = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: lowercasedEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name,
        },
      });

      if (!authError && authData?.user) {
        authUserId = authData.user.id;
      } else {
        console.warn('Supabase Auth creation failed, continuing with custom table only:', authError);
      }
    } catch (authErr) {
      console.warn('Supabase Auth error, continuing with custom table only:', authErr);
    }

    // Create user in custom users table
    const insertData: any = {
      name,
      email: lowercasedEmail,
      password_hash: hashedPassword,
      groq_api_key: groqApiKey,
    };

    // Only add id if we successfully created in Auth
    if (authUserId) {
      insertData.id = authUserId;
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([insertData]);

    if (insertError) {
      // Rollback: delete from Supabase Auth if custom table insert fails
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }
      console.error('Insert error:', insertError);
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
