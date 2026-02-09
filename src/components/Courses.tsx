import { BookOpen, GraduationCap, Microscope, Atom, Building2 } from 'lucide-react';

const courses = [
  { id: 1, title: 'Class 6', icon: BookOpen, color: 'from-blue-500 to-blue-600', description: 'Foundation building for young learners' },
  { id: 2, title: 'Class 7', icon: BookOpen, color: 'from-cyan-500 to-cyan-600', description: 'Strengthening core concepts' },
  { id: 3, title: 'Class 8', icon: BookOpen, color: 'from-sky-500 to-sky-600', description: 'Advanced problem solving skills' },
  { id: 4, title: 'Class 9', icon: GraduationCap, color: 'from-blue-600 to-blue-700', description: 'Board exam preparation starts' },
  { id: 5, title: 'Class 10', icon: GraduationCap, color: 'from-blue-700 to-blue-800', description: 'Complete board exam mastery' },
  { id: 6, title: 'Class 11', icon: Atom, color: 'from-orange-500 to-orange-600', description: 'PCM/PCB/ARTS/COMMERCE stream excellence' },
  { id: 7, title: 'Class 12', icon: Atom, color: 'from-red-500 to-red-600', description: 'Final board exam success' },
  { id: 8, title: 'Foundation', icon: Building2, color: 'from-teal-500 to-teal-600', description: 'Strong base for competitive exams' },
  { id: 9, title: 'NEET', icon: Microscope, color: 'from-green-600 to-green-700', description: 'Medical entrance preparation' },
  { id: 10, title: 'JEE', icon: Atom, color: 'from-yellow-500 to-yellow-600', description: 'Engineering entrance mastery' },
  { id: 11, title: 'JKSSB', icon: Building2, color: 'from-slate-600 to-slate-700', description: 'State service exam prep' },
];

export default function Courses() {
  return (
    <section id="courses" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Path to Success
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive courses designed for every student's journey from school to competitive exams
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>

                <div className={`inline-flex p-3 sm:p-4 rounded-xl bg-gradient-to-br ${course.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={24} />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {course.description}
                </p>

                <div className="mt-6 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  <span>Learn More</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
