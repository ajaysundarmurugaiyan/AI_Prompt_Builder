import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const lowercaseEmail = email.toLowerCase();

    // Check if user exists in our custom users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', lowercaseEmail)
      .single();

    // Always return success to prevent email enumeration attacks
    if (!userError && user) {
      // Send password reset email using Supabase Auth
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        lowercaseEmail,
        {
          redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
        }
      );

      if (resetError) {
        console.error('Supabase password reset error:', resetError);
      } else {
        console.log('✅ Password reset email sent successfully to:', lowercaseEmail);
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({ 
      message: 'If an account exists with that email, a password reset link has been sent. Please check your email.' 
    });
  } catch (err) {
    console.error('Forgot Password API Error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
