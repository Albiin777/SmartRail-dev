import { useEffect, useRef, useState } from "react";
import LabelNavbar from "./LabelNavbar";

function Header() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (diff > 10 && currentY > 150) {
        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            setHidden(true);
            timeoutRef.current = null;
          }, 250);
        }
      }

      if (diff < -5) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 z-50 w-full h-[70px]
          flex items-center justify-between
          px-4 sm:px-8
          bg-[#FFFFFF] dark:bg-[#2B2B2B]
          border-b border-[#D4D4D4]
          transition-all duration-500 ease-out
          ${hidden ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"}
        `}
      >
        <div className="flex items-center gap-3">
          <img src="/trainnew.png" alt="Logo" className="h-[50px]" />
          <span className="text-[24px] font-bold text-[#2B2B2B] dark:text-white">
            SmartRail
          </span>
        </div>

        <a
          href="/login"
          className="
            px-5 py-2 rounded-lg
            border border-[#2B2B2B]
            text-[#2B2B2B]
            hover:bg-[#2B2B2B] hover:text-white
            transition
          "
        >
          Login
        </a>
      </header>

      {/* ✅ correct component */}
      <LabelNavbar hidden={hidden} />
    </>
  );
}

export default Header;
