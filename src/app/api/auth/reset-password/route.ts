import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import bcrypt from 'bcryptjs';

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

    // Find user with matching token and email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, reset_token, reset_token_expiry')
      .eq('email', lowercaseEmail)
      .eq('reset_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.reset_token_expiry) {
      const expiryDate = new Date(user.reset_token_expiry);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { message: 'Reset token has expired. Please request a new one.' },
          { status: 400 }
        );
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token in custom table
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { message: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Try to update in Supabase Auth if user exists there
    try {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: password,
      });
      console.log('✅ Password updated in both custom table and Supabase Auth');
    } catch (authErr) {
      console.log('ℹ️  Password updated in custom table only (Supabase Auth not available)');
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
