import { useEffect, useRef } from "react";
import SeatLayout from "../pages/SeatLayout";

function LabelNavbar({ hidden, setHidden }) {

  const hasNotification = true;
  const lastScrollY = useRef(0);
  const timeoutRef = useRef(null);

  const navItem =
    "relative group whitespace-nowrap text-sm font-medium text-[#2B2B2B] hover:text-black cursor-pointer px-1 transition-colors duration-200";

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
  }, [setHidden]);

  return (
    <nav
      className={`
        fixed
        top-[70px]
        left-0
        w-full
        h-[48px]
        z-40
        bg-[#D4D4D4]
        border-b border-[#B3B3B3]
        transition-all duration-500 ease-out
        ${hidden ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"}
      `}
    >
      <div
        className="
          h-full
          flex
          items-center
          gap-8
          px-4
          justify-start
          overflow-x-auto
          lg:justify-center
          lg:overflow-x-visible
          scrollbar-hide
        "
      >

        <a className={navItem}>
          Notifications
          {hasNotification && (
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a href="#pnr-section" className={navItem}>
          PNR Status
          <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a className={navItem}>
          Booking History
          <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a className={navItem}>
          Seat Availability
          <span href="SmartRail-dev\frontend\src\pages\SeatLayout.jsx" className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a className={navItem}>
          About Us
          <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <a className={navItem}>
          Support
          <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#2B2B2B] transition-all duration-300 group-hover:w-full"></span>
        </a>

      </div>
    </nav>
  );
}

export default LabelNavbar;
