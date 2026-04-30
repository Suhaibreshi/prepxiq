import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, storeOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone, channel } = await req.json();

    if (!phone) {
      return NextResponse.json({ message: 'phone required' }, { status: 400 });
    }

    const otp = generateOtp();
    storeOtp(phone, otp);

    // Attempt to use Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const client = (await import('twilio')).default(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        if (channel === 'whatsapp' && process.env.TWILIO_WHATSAPP_FROM) {
          await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: `whatsapp:${phone}`,
            body: `Your OTP: ${otp}`,
          });
          return NextResponse.json({ message: 'OTP sent via WhatsApp' });
        }

        if (process.env.TWILIO_SMS_FROM) {
          await client.messages.create({
            from: process.env.TWILIO_SMS_FROM,
            to: phone,
            body: `Your OTP: ${otp}`,
          });
          return NextResponse.json({ message: 'OTP sent via SMS' });
        }
      } catch (err) {
        console.error('Twilio error', err);
      }
    }

    // Fallback demo: log OTP
    console.log(`Demo OTP for ${phone}: ${otp}`);
    return NextResponse.json({ message: 'Demo mode: OTP logged on server console' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}