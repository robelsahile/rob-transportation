import SocialMediaIcons from './SocialMediaIcons';
import { APP_NAME } from '../constants';

type FooterProps = {
  onNavigateToAdmin: () => void;
  onNavigateToBlog: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
  onNavigateToCities: () => void;
};

export default function Footer({ 
  onNavigateToAdmin, 
  onNavigateToBlog, 
  onNavigateToAbout, 
  onNavigateToContact, 
  onNavigateToCities 
}: FooterProps) {
  return (
    <footer className="bg-brand-primary text-white mt-10">
      {/* Top Section - Brand */}
      <div>
        <div className="container mx-auto px-4 sm:px-8 py-6 max-w-5xl border-b border-white/20">
          {/* Title with same styling as header */}
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {APP_NAME}
          </h1>
          <p className="text-sm text-gray-300">Premium transportation services in Seattle area</p>
        </div>
      </div>

      {/* Middle Section - Navigation Columns */}
      <div>
        <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl border-b border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {/* Company Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={onNavigateToAbout}
                    className="hover:opacity-90 transition-opacity"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToBlog}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToContact}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToAdmin}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Admin
                  </button>
                </li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>Airport Transfer</li>
                <li>City Transportation</li>
                <li>Event Transportation</li>
                <li>Corporate Travel</li>
                <li>Special Events</li>
                <li>Hourly Service</li>
                <li>Group Transportation</li>
                <li>Cruise Transportation</li>
              </ul>
            </div>

            {/* Top Cities Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Top Cities</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Seattle
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Bellevue
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Redmond
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Kirkland
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    Tacoma
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToCities}
                    className="hover:opacity-90 transition-opacity"
                  >
                    All Cities
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright, Legal & Social Media */}
      <div className="container mx-auto px-4 sm:px-8 py-6 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright and Legal */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm">
            <p>© {new Date().getFullYear()} ROB Transportation. All rights reserved.</p>
            <div className="flex space-x-4">
              <button className="hover:opacity-90 transition-opacity">Terms</button>
              <button className="hover:opacity-90 transition-opacity">Privacy Policy</button>
              <button className="hover:opacity-90 transition-opacity">Legal Notice</button>
              <button className="hover:opacity-90 transition-opacity">Accessibility</button>
            </div>
          </div>

          {/* Social Media Icons */}
          <SocialMediaIcons />
        </div>
      </div>
    </footer>
  );
}
