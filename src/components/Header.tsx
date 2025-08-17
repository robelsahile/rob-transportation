
import React from 'react';
import { APP_NAME } from '../../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-primary shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-white tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-gray-300">Book Your Next Ride.</p>
      </div>
    </header>
  );
};

export default Header;