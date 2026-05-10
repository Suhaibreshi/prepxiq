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
  
  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<'profile' | 'password' | null>(null);
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
    if (drawerOpen && drawerView === 'profile' && !profileData) {
      fetchProfileDetails();
    }
  }, [drawerOpen, drawerView, profileData]);

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

  const openDrawer = (view: 'profile' | 'password') => {
    setDrawerView(view);
    setDrawerOpen(true);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <>
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
                        onClick={() => openDrawer('profile')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User size={18} />
                        My Profile
                      </button>
                      
                      <button
                        onClick={() => openDrawer('password')}
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
                    onClick={() => openDrawer('profile')}
                    className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center gap-3"
                  >
                    <User size={18} />
                    My Profile
                  </button>
                  <button
                    onClick={() => openDrawer('password')}
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
      </nav>

      {/* Side Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-500 ${drawerOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setDrawerOpen(false)}
        />
        
        {/* Drawer Content */}
        <div 
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {drawerView === 'profile' ? 'Profile Details' : 'Change Password'}
              </h2>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {drawerView === 'profile' ? (
                !profileData ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Fetching your details...</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-lg shadow-blue-100 text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-bold border border-white/30">
                        {profileData.name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{profileData.name}</h3>
                        <p className="text-blue-100 text-sm font-medium opacity-90">{profileData.registration_number}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <DrawerItem label="Email Address" value={profileData.email_address} icon={<UserCircle size={20} />} />
                      <DrawerItem label="Mobile Number" value={profileData.mobile_number} icon={<User size={20} />} />
                      <DrawerItem label="Father's/Guardian Name" value={profileData.father_guardian_name} icon={<User size={20} />} />
                      <DrawerItem label="Gender" value={profileData.gender} icon={<User size={20} />} />
                      <DrawerItem label="Current Class" value={profileData.current_class} icon={<User size={20} />} />
                      <DrawerItem label="Course/Program" value={profileData.course_program} icon={<User size={20} />} />
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                       <div className="bg-green-50 text-green-700 px-4 py-4 rounded-2xl flex items-center gap-3 border border-green-100 shadow-sm">
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-xs font-bold uppercase tracking-widest">Official Student Account</span>
                       </div>
                    </div>
                  </div>
                )
              ) : (
                <PasswordForm onSuccess={() => setDrawerOpen(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DrawerItem({ label, value, icon }: { label: string; value?: string; icon: React.ReactNode }) {
  return (
    <div className="group">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1 group-hover:text-blue-600 transition-colors">{label}</p>
      <div className="flex items-center gap-3 text-gray-900 font-semibold bg-white px-5 py-4 rounded-2xl border border-gray-100 group-hover:border-blue-200 transition-all shadow-sm group-hover:shadow-md">
        <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</span>
        <span className="truncate">{value || 'Not provided'}</span>
      </div>
    </div>
  );
}

function PasswordForm({ onSuccess }: { onSuccess: () => void }) {
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
        setTimeout(onSuccess, 1500);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
          <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Updated!</h3>
          <p className="text-gray-500">Your password is now secure.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 shadow-sm">
          <X size={18} />
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Current Password</label>
          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all font-semibold shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">New Password</label>
          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all font-semibold shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Confirm New Password</label>
          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all font-semibold shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            Updating...
          </>
        ) : (
          <>
            Update Password
            <ChevronRight size={20} />
          </>
        )}
      </button>
    </form>
  );
}