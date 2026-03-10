import { Shield, Users, BookOpen, Trophy, CheckCircle, Star } from 'lucide-react';

const trustFactors = [
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Curated content by experienced educators',
  },
  {
    icon: Users,
    title: 'Expert Faculty',
    description: 'Learn from industry-leading teachers',
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Coverage',
    description: 'Complete syllabus with in-depth study material',
  },
  {
    icon: Trophy,
    title: 'Proven Results',
    description: 'Track record of student success',
  },
];

const commitments = [
  'Regular performance tracking and analysis',
  'Personalized learning paths for each student',
  'Updated content aligned with latest exam patterns',
  'Affordable pricing with flexible payment options',
  'Regular parent-teacher interaction sessions',
  'Dedicated student support team',
];

export default function Trust() {
  return (
    <section id="about" className="py-12 sm:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-full mb-4">
            <Star size={16} sm:size-18 fill="currentColor" />
            <span className="text-xs sm:text-sm font-semibold">Trusted by Students & Parents</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Your Success is Our Priority
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Building India's next generation of achievers with quality education and dedicated support
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {trustFactors.map((factor, index) => {
            const Icon = factor.icon;
            return (
              <div
                key={index}
                className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="inline-flex p-3 sm:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 mb-3 sm:mb-4 transition-colors duration-300">
                  <Icon className="text-blue-600" size={24} sm-size={28} lg-size={32} />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{factor.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">{factor.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Our Commitment to Excellence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {commitments.map((commitment, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 sm:space-x-3 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <CheckCircle className="text-green-500" size={18} sm-size={20} />
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">{commitment}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Quality Content</div>
                </div>
                <div className="hidden sm:block w-px h-10 sm:h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600">Student Support</div>
                </div>
                <div className="hidden sm:block w-px h-10 sm:h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">10+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Course Options</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
