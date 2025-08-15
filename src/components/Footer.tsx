
import React from 'react';
import { APP_NAME } from '../constants';

interface FooterProps {
  onNavigateToAdmin: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="bg-brand-primary text-gray-300 py-6 text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-xs mt-1">Experience the difference with premium travel.</p>
        <div className="mt-4">
          <button onClick={onNavigateToAdmin} className="text-xs text-gray-400 hover:text-white transition-colors">
            Admin View
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;