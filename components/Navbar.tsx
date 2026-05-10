'use client';

import { Menu, X, ChevronDown, ChevronRight, User, LogOut, Key, UserCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  onRegisterClick?: () => void;
  hideRegisterButton?: boolean;
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

export default function Navbar({ onRegisterClick, hideRegisterButton }: NavbarProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Mobile accordion states
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCoursesOpen(false);
        setActiveCategory(null);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      if (data.success) {
        setProfileData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    if (showProfileModal && !profileData) {
      fetchProfileDetails();
    }
  }, [showProfileModal, profileData]);

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

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
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
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <UserCircle size={24} />
                  <span className="font-medium text-sm hidden lg:inline-block">{user?.name || 'My Profile'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User size={18} />
                      My Profile
                    </button>
                    
                    <button
                      onClick={() => { setShowPasswordModal(true); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Key size={18} />
                      Change Password
                    </button>

                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
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
                <div className="px-4 py-3 border-b border-gray-100 mb-2 bg-blue-50/50 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowProfileModal(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                >
                  <User size={18} />
                  My Profile
                </button>
                <button
                  onClick={() => { setShowPasswordModal(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                >
                  <Key size={18} />
                  Change Password
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-3"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
                {!hideRegisterButton && (
                  <button
                    onClick={() => {
                      onRegisterClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Register Now
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              {!profileData ? (
                <div className="text-center py-8 text-gray-500">Loading details...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Full Name" value={profileData.name} />
                    <DetailItem label="Reg Number" value={profileData.registration_number} />
                    <DetailItem label="Email" value={profileData.email_address} />
                    <DetailItem label="Mobile" value={profileData.mobile_number} />
                    <DetailItem label="Father's Name" value={profileData.father_guardian_name} />
                    <DetailItem label="Gender" value={profileData.gender} />
                    <DetailItem label="Class" value={profileData.current_class} />
                    <DetailItem label="Course" value={profileData.course_program} />
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Account status: <span className="text-green-600 font-medium">Approved Student</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </nav>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium border border-green-100">
              Password updated successfully!
            </div>
          ) : (
            <>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}