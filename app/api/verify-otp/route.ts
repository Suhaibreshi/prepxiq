import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ message: 'phone and otp required' }, { status: 400 });
    }

    const isValid = verifyOtp(phone, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Return demo token (in production, integrate with NextAuth properly)
    return NextResponse.json({
      token: `demo-token-${phone}-${Date.now()}`,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}