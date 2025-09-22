import React from "react";
import { APP_NAME } from "../constants";

type HeaderProps = {
  onNavigateHome: () => void;
};

const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="bg-brand-primary shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Title is clickable */}
        <h1
          onClick={onNavigateHome}
          className="text-3xl font-bold text-white tracking-tight cursor-pointer hover:opacity-90 transition"
        >
          {APP_NAME}
        </h1>
        <p className="text-sm text-gray-300">Book Your Next Ride.</p>
      </div>
    </header>
  );
};

export default Header;
