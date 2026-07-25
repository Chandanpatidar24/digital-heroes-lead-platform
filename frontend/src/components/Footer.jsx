import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#faf6ee]/90 border-t border-stone-200 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-stone-600">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-stone-900">Digital Heroes</span>
          <span>&copy; {new Date().getFullYear()} Lead Management Platform</span>
        </div>
        
        {/* MANDATORY LIVE BUILD REQUIREMENT CREDIT LINE */}
        <div className="bg-white px-4 py-2 rounded-full border border-stone-300/80 text-xs shadow-xs text-stone-700">
          Built for Digital Heroes Training Task &bull;{' '}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:text-amber-900 underline font-bold transition-colors"
          >
            digitalheroesco.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
