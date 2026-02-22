import React from "react";

function Footer() {
  return (
    <footer className="bg-blue-100 border-t border-blue-200 py-3 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left - Logo + Developed by */}
        <div className="flex items-center gap-2">
          <img
            src="/mobicloud_logo.png"
            alt="MobiCloud Logo"
            className="h-5 object-contain"
          />
          <p className="text-xs text-gray-500 font-semibold">
            Developed by Vijay Patil
          </p>
        </div>

        {/* Center - Quote */}
        <p className="text-xs text-gray-400 italic text-center">
          "Built with passion, powered by purpose."
        </p>

        {/* Right - Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/vijaypatil2003/"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              className="h-5 w-5 opacity-60 hover:opacity-100 transition-all duration-200"
              alt="GitHub"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/vijaypatil0106/"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
              className="h-5 w-5 opacity-60 hover:opacity-100 transition-all duration-200"
              alt="LinkedIn"
            />
          </a>
          <a
            href="http://personal-portfolio-beta-five-78.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-all duration-200"
          >
            Portfolio
          </a>
          <a
            href="mailto:vijayptl0106@gmail.com"
            className="text-xs text-gray-400 hover:text-blue-600 transition-all duration-200"
          >
            vijayptl0106@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
