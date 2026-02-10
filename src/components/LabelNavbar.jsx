function LabelNavbar({ hidden }) {
  const hasNotification = true;

  return (
    <nav
      className={`
        fixed top-[70px] left-0 z-40 w-full h-[48px]
        bg-[#D4D4D4] dark:bg-[#B3B3B3]
        border-b border-[#B3B3B3]
        transition-all duration-300 ease-out
        ${hidden
          ? "-translate-y-4 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"}
      `}
    >
      <div className="h-full flex items-center gap-6 px-4 overflow-x-auto md:justify-center">
        <a className="relative whitespace-nowrap text-sm font-medium text-[#2B2B2B]">
          Notifications
          {hasNotification && (
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </a>

        <a className="whitespace-nowrap text-sm font-medium text-[#2B2B2B]">
          PNR Status
        </a>

        <a className="whitespace-nowrap text-sm font-medium text-[#2B2B2B]">
          Booking History
        </a>

        <a className="whitespace-nowrap text-sm font-medium text-[#2B2B2B]">
          About Us
        </a>

        <a className="whitespace-nowrap text-sm font-medium text-[#2B2B2B]">
          Support
        </a>
      </div>
    </nav>
  );
}

export default LabelNavbar;
