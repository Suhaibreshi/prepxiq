import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../auth/AuthContext';

interface NavbarProps {
  onRegisterClick?: () => void;
}

const courseCategories = [
  {
    name: 'Foundation',
    subOptions: [
      { label: '6th Class', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPU9hwQZwd7wAG2PAeZWW1Te&si=EO4OL1w9yywZFlF5' },
      { label: '7th Class', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPXH-32cFl4cdN5QfroDS5rw&si=l2jQ2h9ARusbD4lE' },
      { label: '8th Class', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPVns7KOMzAvroIVuwuMnkIV&si=uFYvkxhBir12sxMx' },
      { label: '9th Class', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUBcBpLg4NVnLJM7WKiG57A&si=3uBWfyKjeCmYrrg1' },
      { label: '10th Class', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUPVzcHU0M0imC_s9jaeOmc&si=TBUXZn-Mbn4L_fZm' },
    ],
  },
  {
    name: 'Science',
    subOptions: [
      { label: '11th - PCM', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUunv5g-GzdSRZxzrWZj6uT&si=aS6ObdwIFeFiC5FT' },
      { label: '12th - PCM', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPXUyO7Or4g3Z55FIdxBDnXg&si=Um_dyslwuvcWAUwL' },
      { label: '11th - PCB', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUunv5g-GzdSRZxzrWZj6uT&si=aS6ObdwIFeFiC5FT' },
      { label: '12th - PCB', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPXUyO7Or4g3Z55FIdxBDnXg&si=Um_dyslwuvcWAUwL' },
    ],
  },
  {
    name: 'Arts',
    subOptions: [
      { label: '11th - Arts', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUunv5g-GzdSRZxzrWZj6uT&si=aS6ObdwIFeFiC5FT' },
      { label: '12th - Arts', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPXUyO7Or4g3Z55FIdxBDnXg&si=Um_dyslwuvcWAUwL' },
    ],
  },
  {
    name: 'Commerce',
    subOptions: [
      { label: '11th - Commerce', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUunv5g-GzdSRZxzrWZj6uT&si=aS6ObdwIFeFiC5FT' },
      { label: '12th - Commerce', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPXUyO7Or4g3Z55FIdxBDnXg&si=Um_dyslwuvcWAUwL' },
    ],
  },
  {
    name: 'Competitive Exams',
    subOptions: [
      { label: 'JEE', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPX2cyuwdxlkgmk2D6fzqK_s&si=DjAO6OuvIMA-hUsq' },
      { label: 'NEET', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPUT2pQoWHSA7p0rrOU8Sp7a&si=lN-tVdWDQjoPVDhw' },
      { label: 'JKSSB', url: 'https://youtube.com/playlist?list=PLoVpUIFtthPWK4S0RIjyLyOc6NZvg0wc5&si=7okuJvM4DA7HOY7z' },
    ],
  },
];

export default function Navbar({ onRegisterClick }: NavbarProps) {
  const { isAuthenticated, phone, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  // Mobile accordion states
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCoursesOpen(false);
        setActiveCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCoursesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCoursesOpen(false);
      setActiveCategory(null);
    }, 200);
  };

  const handleCategoryEnter = (index: number) => {
    setActiveCategory(index);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Courses Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
              >
                Courses
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* First-level dropdown */}
              {isCoursesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {courseCategories.map((category, index) => (
                    <div
                      key={category.name}
                      className="relative"
                      onMouseEnter={() => handleCategoryEnter(index)}
                    >
                      <button
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${activeCategory === index
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                      >
                        {category.name}
                        <ChevronRight size={14} className="text-gray-400" />
                      </button>

                      {/* Second-level fly-out */}
                      {activeCategory === index && (
                        <div className="absolute left-full top-0 ml-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                          {category.subOptions.map((option) => (
                            <a
                              key={option.label}
                              href={option.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                            >
                              {option.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </a>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">{phone?.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 ****')}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile Courses Accordion */}
            <div>
              <button
                onClick={() => {
                  setMobileCoursesOpen(!mobileCoursesOpen);
                  if (mobileCoursesOpen) setMobileActiveCategory(null);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
              >
                Courses
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${mobileCoursesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {mobileCoursesOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-100 pl-2">
                  {courseCategories.map((category, index) => (
                    <div key={category.name}>
                      <button
                        onClick={() =>
                          setMobileActiveCategory(mobileActiveCategory === index ? null : index)
                        }
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mobileActiveCategory === index
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                      >
                        {category.name}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${mobileActiveCategory === index ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {mobileActiveCategory === index && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-blue-50 pl-2">
                          {category.subOptions.map((option) => (
                            <a
                              key={option.label}
                              href={option.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {option.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a
              href="#features"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#about"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-gray-500 text-sm">
                  {phone?.replace(/(\+91)(\d{5})(\d{5})/, '+91 $2 ****')}
                </div>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
                <button
                  onClick={() => {
                    onRegisterClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Register Now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
