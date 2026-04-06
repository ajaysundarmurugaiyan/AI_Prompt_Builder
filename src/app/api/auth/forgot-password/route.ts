import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const lowercaseEmail = email.toLowerCase();

    // Check if user exists in Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ message: 'Error checking email' }, { status: 500 });
    }

    const userExists = users.find(user => user.email?.toLowerCase() === lowercaseEmail);

    if (!userExists) {
      return NextResponse.json({ 
        message: 'Email does not exist in our system',
        exists: false 
      }, { status: 404 });
    }

    // Generate a temporary reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in user metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userExists.id,
      {
        user_metadata: {
          ...userExists.user_metadata,
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        }
      }
    );

    if (updateError) {
      console.error('Error storing reset token:', updateError);
      return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }

    console.log('✅ Email verified, reset token generated for:', lowercaseEmail);

    return NextResponse.json({ 
      message: 'Email verified successfully',
      exists: true,
      token: resetToken,
      email: lowercaseEmail
    }, { status: 200 });
  } catch (err) {
    console.error('Forgot Password API Error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
