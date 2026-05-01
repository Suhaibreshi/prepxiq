'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useAuth } from '@/auth/AuthContext';
import { MessageSquare, Phone, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const phoneNumber = `+91${phone}`;
    const result = await sendOtp(phoneNumber, channel);

    if (result.ok) {
      sessionStorage.setItem('prepxiq_phone', phoneNumber);
      router.push('/verify-otp');
    } else {
      setError(result.message || 'Failed to send OTP');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your phone number to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSendOtp} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Channel selection */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border rounded-lg font-medium text-sm transition-colors ${
                  channel === 'whatsapp'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={16} />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border rounded-lg font-medium text-sm transition-colors ${
                  channel === 'sms'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Phone size={16} />
                SMS
              </button>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
