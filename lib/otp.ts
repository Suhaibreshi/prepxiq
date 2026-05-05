const otps = new Map<string, { otp: string; expiresAt: number }>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(phone: string, otp: string) {
  const expiresAt = Date.now() + 1000 * 60 * 5; // 5 min
  otps.set(phone, { otp, expiresAt });
}

export function verifyOtp(phone: string, otp: string): boolean {
  const record = otps.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otps.delete(phone);
    return false;
  }
  if (record.otp !== otp) return false;
  otps.delete(phone);
  return true;
}