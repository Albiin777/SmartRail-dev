import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] text-white px-8 pt-10 pb-5">
      <div className="max-w-[1200px] mx-auto">

        {/* BRAND */}
        <div className="text-center mb-10 pb-8 border-b border-white/10">
          <h2 className="text-[32px] font-bold text-[#4fc3f7]">
            SmartRail
          </h2>

          <p className="text-sm text-[#bbdefb] mt-2">
            Intelligent Booking • Smart Travel
          </p>

          <p className="text-sm text-[#e3f2fd] max-w-[400px] mx-auto mt-4 leading-relaxed">
            Your smart choice for train travel. Real-time updates and seamless booking experience.
          </p>
        </div>

        {/* NAV SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* QUICK ACCESS */}
          <div>
            <h3 className="footer-title">Quick Access</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/about">About SmartRail</a></li>
              <li><a href="/pnr-status">PNR Status</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h3 className="footer-title">My Account</h3>
            <ul className="footer-links">
              <li><a href="/signin">Sign In</a></li>
              <li><a href="/notifications">Notifications</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="footer-title">Need Help?</h3>

            <div className="flex flex-col gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-[#bbdefb]">24/7 Helpline</p>
                <p className="text-sm font-semibold mt-1">1800-SMART-RAIL</p>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-[#bbdefb]">Email Support</p>
                <p className="text-sm font-semibold mt-1">support@smartrail.com</p>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="pt-6 border-t border-white/10 text-center">
          <div className="flex justify-center gap-4 mb-5">
  <a
    href="https://facebook.com"
    aria-label="Facebook"
    className="socialIcon"
  >
    <FaFacebookF size={18} />
  </a>

  <a
    href="https://twitter.com"
    aria-label="Twitter"
    className="socialIcon"
  >
    <FaTwitter size={18} />
  </a>

  <a
    href="https://instagram.com"
    aria-label="Instagram"
    className="socialIcon"
  >
    <FaInstagram size={18} />
  </a>
</div>


          <p className="text-sm text-[#bbdefb]">
            © 2026 SmartRail. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
