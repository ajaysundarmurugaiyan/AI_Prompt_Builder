import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get the session from cookies (Supabase sets this during password reset flow)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset session' },
        { status: 401 }
      );
    }

    // Get user from Supabase Auth using the access token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Update password in Supabase Auth
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateAuthError) {
      console.error('Error updating Supabase Auth password:', updateAuthError);
      return NextResponse.json(
        { message: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Hash the new password for custom table
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in custom users table
    const { error: updateTableError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id);

    if (updateTableError) {
      console.error('Error updating custom table password:', updateTableError);
      // Auth password is already updated, so we continue
    }

    console.log('✅ Password reset successfully for user:', user.email);

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
