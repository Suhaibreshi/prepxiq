import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onRegisterClick?: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 sm:mb-8">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">India's Next-Gen Exam Prep Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            PREPX IQ – Smart Preparation
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              for Serious Results
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Comprehensive exam preparation for Class 6–12, Foundation, NEET, JEE & JKSSB
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span>Register Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              Explore Courses
            </button>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-sm sm:text-base text-gray-600">Courses</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm sm:text-base text-gray-600">Quality Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
    </section>
  );
}
