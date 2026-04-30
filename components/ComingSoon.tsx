import { ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonProps {
  featureTitle: string;
  onBack: () => void;
}

export default function ComingSoon({ featureTitle, onBack }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100">
              <Clock className="text-blue-600" size={64} />
            </div>
          </div>

          {/* Main Text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Coming Soon!
          </h1>

          <h2 className="text-2xl sm:text-3xl font-semibold text-blue-600 mb-6">
            {featureTitle}
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            We are working hard to bring you an amazing {featureTitle} experience.
            This feature will be available very soon. Thank you for your patience!
          </p>

          {/* Decorative Elements */}
          <div className="mb-12 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-600">
              Want to be notified when {featureTitle.toLowerCase()} is live?
              <br />
              <span className="font-semibold text-gray-900">Register to get updates!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}