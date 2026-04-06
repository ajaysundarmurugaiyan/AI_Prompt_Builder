import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const lowercaseEmail = email.toLowerCase();

    // Get all users and find the one with matching email and token
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }

    const user = users.find(u => 
      u.email?.toLowerCase() === lowercaseEmail && 
      u.user_metadata?.reset_token === token
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.user_metadata?.reset_token_expiry) {
      const expiryDate = new Date(user.user_metadata.reset_token_expiry);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { message: 'Reset token has expired. Please request a new one.' },
          { status: 400 }
        );
      }
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: password,
        user_metadata: {
          ...user.user_metadata,
          reset_token: null,
          reset_token_expiry: null,
        }
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { message: 'Failed to update password' },
        { status: 500 }
      );
    }

    console.log('✅ Password reset successfully for:', lowercaseEmail);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
