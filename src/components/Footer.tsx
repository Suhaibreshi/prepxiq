import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo className="h-14 sm:h-16" invert={true} />
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              PREPX IQ is your trusted partner for comprehensive exam preparation. We're committed to helping students achieve their academic dreams with quality education and expert guidance.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/@prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://linkedin.com/company/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-500 flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://facebook.com/prepxiq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-colors duration-300"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
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
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Achabal, Anantnag
                  <br />
                  Near Smart Kids School, Achabal
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:hello.prepxiq@gmail.com"
                  className="text-sm hover:text-blue-400 transition-colors"
                >
                  hello.prepxiq@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <a
                    href="tel:+916006645829"
                    className="block hover:text-blue-400 transition-colors"
                  >
                    +91 60066 45829
                  </a>
                  <a
                    href="tel:+917006604969"
                    className="block hover:text-blue-400 transition-colors"
                  >
                    +91 7006604969
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} PREPX IQ. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
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
