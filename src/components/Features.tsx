import { FileText, HelpCircle, Users, Clock, Award, Target } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Mock Tests',
    description: 'Comprehensive test series designed to simulate real exam conditions and boost your confidence',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    stats: '1000+ Questions',
  },
  {
    id: 2,
    title: 'Q&A Practice',
    description: 'Extensive question bank with detailed solutions to master every topic and concept',
    icon: HelpCircle,
    color: 'from-cyan-500 to-cyan-600',
    stats: 'Topic-Wise',
  },
  {
    id: 3,
    title: 'Expert Doubt Solving',
    description: 'One-on-one personalized doubt clearing sessions with experienced educators',
    icon: Users,
    color: 'from-teal-500 to-teal-600',
    stats: '24/7 Available',
  },
];

const benefits = [
  { icon: Clock, title: 'Flexible Learning', description: 'Study at your own pace' },
  { icon: Award, title: 'Expert Faculty', description: 'Learn from the best' },
  { icon: Target, title: 'Result-Oriented', description: 'Focused on success' },
];

export default function Features({ onMockTestsClick, onExpertDoubtClick }: { onMockTestsClick?: () => void; onExpertDoubtClick?: () => void }) {
  return (
    <section id="features" className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Advanced Learning Tools
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to accelerate your exam preparation journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isLive = feature.id === 1 || feature.id === 2 || feature.id === 3;
            
            return (
              <div
                key={feature.id}
                className={`group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 ${isLive ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => {
                  if (feature.id === 1 || feature.id === 2) {
                    onMockTestsClick?.();
                  } else if (feature.id === 3) {
                    onExpertDoubtClick?.();
                  }
                }}
              >
                {isLive && (
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Live Now
                    </span>
                  </div>
                )}

                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-sm">{feature.stats}</span>
                </div>

                {isLive && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1">
                      Start Now →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
              Why Choose PREPX IQ?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex p-4 rounded-xl bg-white/10 backdrop-blur-sm mb-4">
                      <Icon size={32} />
                    </div>
                    <h4 className="text-xl font-bold mb-2">{benefit.title}</h4>
                    <p className="text-blue-100">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
