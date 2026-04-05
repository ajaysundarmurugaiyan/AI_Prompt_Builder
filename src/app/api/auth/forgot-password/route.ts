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

    // Check if user exists in our custom users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', lowercaseEmail)
      .single();

    // Always return success to prevent email enumeration attacks
    if (!userError && user) {
      // Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store the reset token in the users table
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        })
        .eq('email', lowercaseEmail);

      if (updateError) {
        console.error('Error storing reset token:', updateError);
      } else {
        // Generate the reset link
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowercaseEmail)}`;
        
        // Log the link (in production, you would send an email here)
        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('║     PASSWORD RESET LINK GENERATED        ║');
        console.log('╚═══════════════════════════════════════════╝');
        console.log('📧 Email:', lowercaseEmail);
        console.log('🔗 Link:', resetLink);
        console.log('⏱️  Expires in: 1 hour');
        console.log('═══════════════════════════════════════════\n');
        
        // Try to send email via Supabase Auth if user exists there
        try {
          const { error: authResetError } = await supabaseAdmin.auth.resetPasswordForEmail(
            lowercaseEmail,
            {
              redirectTo: resetLink,
            }
          );
          
          if (!authResetError) {
            console.log('✅ Email sent via Supabase Auth');
          }
        } catch (authErr) {
          console.log('ℹ️  Supabase Auth email not available, use console link');
        }
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({ 
      message: 'If an account exists with that email, a password reset link has been sent. Please check your email or contact support.' 
    });
  } catch (err) {
    console.error('Forgot Password API Error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
