import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          <div className="lg:col-span-2">
            <div className="mb-3 sm:mb-4">
              <img src="/footer-logo.png" alt="PREPX IQ" className="h-10 sm:h-14 lg:h-16 object-contain mix-blend-screen brightness-200 contrast-125" />
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-md leading-relaxed">
              PREPX IQ is your trusted partner for comprehensive exam preparation. We're committed to helping students achieve their academic dreams with quality education and expert guidance.
            </p>
            <div className="flex gap-2 sm:gap-4">
              <a
                href="https://instagram.com/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram size={18} className="sm:size-{20}" />
              </a>
              <a
                href="https://youtube.com/@prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Youtube size={18} className="sm:size-{20}" />
              </a>
              <a
                href="https://linkedin.com/company/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin size={18} className="sm:size-{20}" />
              </a>
              <a
                href="https://facebook.com/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook size={18} className="sm:size-{20}" />
              </a>
              <a
                href="https://wa.me/919149747791"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-green-500 flex items-center justify-center transition-colors duration-300"
              >
                <Phone size={18} className="sm:size-{20}" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a href="#courses" className="hover:text-blue-400 transition-colors">
                  Courses
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin size={16} className="sm:size-{20} text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Achabal, Anantnag
                </span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail size={16} className="sm:size-{20} text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:hello@prepxiq.com"
                  className="hover:text-blue-400 transition-colors break-all"
                >
                  hello@prepxiq.com
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <Phone size={16} className="sm:size-{20} text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <a
                    href="tel:+919149747791"
                    className="block hover:text-blue-400 transition-colors"
                  >
                    +91 9149747791
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <p className="text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} PREPX IQ. All rights reserved.
            </p>
            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}