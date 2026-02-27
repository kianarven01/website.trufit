import React from "react";

const Footer: React.FC = () => {
  return (
    <>
      {/* Footer */}
      <section
        id="footer"
        className="py-10 px-10 bg-slate-900 text-gray-400 text-center select-none"
      >
        <p>
          &copy; {new Date().getFullYear()} Trufit Auto Center. All rights reserved.
        </p>
      </section>
    </>
  );
};

export default Footer;