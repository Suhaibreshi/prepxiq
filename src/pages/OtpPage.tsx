import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 300;

export default function OtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOtp, sendOtp } = useAuth();

  const phone = searchParams.get('phone') || '';
  const maskedPhone = phone.replace(/(\+91)(\d{5})(\d{5})/, '+91 $2*****');

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phone, navigate]);

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit.slice(-1);
    setDigits(newDigits);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === OTP_LENGTH - 1 && digit) {
      const otp = newDigits.join('');
      if (otp.length === OTP_LENGTH) {
        handleVerify(otp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    setError('');
    const result = await verifyOtp(phone, otp);
    setIsLoading(false);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid OTP');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    setTimeLeft(EXPIRY_SECONDS);
    const result = await sendOtp(phone, 'sms');
    if (!result.ok) {
      setError(result.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link to="/login" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
              <h1 className="text-2xl font-bold mb-1">Verify OTP</h1>
              <p className="text-blue-100 text-sm">Code sent to {maskedPhone}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Timer */}
              <div className="text-center">
                <span
                  className={`text-sm font-medium ${
                    timeLeft === 0 ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {timeLeft === 0 ? 'Code expired' : `Expires in ${formatTime(timeLeft)}`}
                </span>
              </div>

              {/* OTP input boxes */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={() => handleVerify(digits.join(''))}
                disabled={!isComplete || isLoading}
                className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {timeLeft === 0 ? (
                  <button
                    onClick={handleResend}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Resend available in {formatTime(timeLeft)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}