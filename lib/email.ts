import nodemailer from 'nodemailer';

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendStatusEmail(
  registration: { name: string; registration_number: string; email_address?: string; course_program?: string; batch_class_timing?: string },
  newStatus: 'approved' | 'rejected'
) {
  if (!registration.email_address) return;

  const subject =
    newStatus === 'approved'
      ? 'Your PREPX IQ Registration is Approved'
      : 'Your PREPX IQ Registration Update';

  const body =
    newStatus === 'approved'
      ? `Congratulations ${registration.name},\n\nYour registration (${registration.registration_number}) for ${registration.course_program} has been approved. Welcome to PREPX IQ!\n\nBatch timing: ${registration.batch_class_timing || 'To be announced'}\n\nRegards,\nPREPX IQ Team`
      : `Dear ${registration.name},\n\nYour registration (${registration.registration_number}) could not be approved at this time. Please contact us at hello@prepxiq.com for more information.\n\nRegards,\nPREPX IQ Team`;

  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'hello@prepxiq.com',
      to: registration.email_address,
      subject,
      text: body,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
}
