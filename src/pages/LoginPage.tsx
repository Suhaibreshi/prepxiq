import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, MessageSquare, Phone } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 10);
  const isValid = phone.length === 10;

  const handleSend = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError('');
    const result = await sendOtp(`+91${phone}`, channel);
    setIsLoading(false);
    if (result.ok) {
      navigate(`/verify-otp?phone=${encodeURIComponent(`+91${phone}`)}`);
    } else {
      setError(result.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <span className="font-bold text-lg">PREP X IQ</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-center text-white">
              <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
              <p className="text-blue-100 text-sm">Enter your phone to continue</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Phone input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                  <span className="px-4 py-3 bg-gray-50 text-gray-600 font-medium text-sm border-r border-gray-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(digitsOnly(e.target.value))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 text-base outline-none bg-white"
                    maxLength={10}
                  />
                </div>
                {phone.length > 0 && phone.length < 10 && (
                  <p className="text-red-500 text-xs mt-1">{phone.length}/10 digits</p>
                )}
              </div>

              {/* Channel toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Send OTP via
                </label>
                <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                      channel === 'sms'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Phone size={16} />
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                      channel === 'whatsapp'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare size={16} />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSend}
                disabled={!isValid || isLoading}
                className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}