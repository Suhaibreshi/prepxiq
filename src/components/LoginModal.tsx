import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [step, setStep] = useState<'enter' | 'verify'>('enter');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  async function handleSend() {
    setLoading(true);
    setMessage(null);
    const res = await sendOtp(phone, channel);
    setLoading(false);
    if (res.ok) {
      setStep('verify');
      setMessage('OTP sent. Check your messages.');
    } else {
      setMessage(res.message || 'Failed to send OTP');
    }
  }

  async function handleVerify() {
    setLoading(true);
    setMessage(null);
    const res = await verifyOtp(phone, otp);
    setLoading(false);
    if (res.ok) {
      setMessage('Login successful');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setMessage(res.message || 'Invalid OTP');
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Login to access lectures</h3>
        {step === 'enter' ? (
          <>
            <label className="block text-sm font-medium text-gray-700">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="mt-1 block w-full border rounded-md p-2"
            />

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Send OTP via</label>
              <div className="mt-2 flex gap-2">
                <button
                  className={`px-3 py-2 rounded ${channel === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setChannel('whatsapp')}
                >
                  WhatsApp
                </button>
                <button
                  className={`px-3 py-2 rounded ${channel === 'sms' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                  onClick={() => setChannel('sms')}
                >
                  SMS
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2" onClick={onClose} disabled={loading}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSend} disabled={loading || !phone}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="mt-1 block w-full border rounded-md p-2"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2" onClick={() => setStep('enter')} disabled={loading}>Back</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleVerify} disabled={loading || !otp}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </>
        )}

        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
