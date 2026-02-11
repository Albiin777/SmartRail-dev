import { useEffect, useState } from "react";
import LabelNavbar from "../labels/LabelNavbar";
import Auth from "./Auth";

function Header({ onLoginClick }) {
  const [hidden, setHidden] = useState(false);
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // LabelNavbar handles scroll-based show/hide; no scroll listener here.

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 z-[60] w-full h-[70px]
          flex items-center justify-between
          px-4 sm:px-8
          bg-[#FFFFFF] dark:bg-[#2B2B2B]
          border-b border-[#D4D4D4]
          /* Removed the translate and opacity logic from here so it stays fixed */
        `}
      >
        <div className="flex items-center gap-3">
          <img src="/trainnew.png" alt="Logo" className="h-[50px]" />
          <span className="text-[24px] font-bold text-[#2B2B2B] dark:text-white">
            SmartRail
          </span>
        </div>

        <button
          onClick={onLoginClick}
          className="
          px-5 py-2 rounded-lg
          border border-[#2B2B2B]
          text-[#2B2B2B]
          hover:bg-[#2B2B2B] hover:text-white
          transition
          ">
          {user ? user.name : "Login"}
        </button>
      </header>

      {/* LabelNavbar still receives the 'hidden' prop to handle its own animation */}
      <LabelNavbar hidden={hidden} setHidden={setHidden} />
    </>
  );
}

export default Header;