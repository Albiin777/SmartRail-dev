function Hero() {
  return (
    <section className="relative w-full flex items-center justify-center text-center px-6 sm:px-10 md:px-16 pt-24 pb-5 sm:pb-7 md:pb-10 bg-transparent">

      <div className="w-full max-w-6xl mx-auto">

        {/* MAIN HEADING */}
        <h1 className="
          text-3xl 
          sm:text-4xl 
          md:text-5xl 
          lg:text-6xl 
          font-bold 
          text-[#FFFFFF]
          leading-tight
        ">
          Book Smarter
          <br className="hidden sm:block" />
          <span className="block sm:inline text-[#FFFFFF]">
            Travel Faster
          </span>
        </h1>

        {/* SUBHEADING */}
        <div className="mt-6 overflow-hidden w-full">
          <h3 className="
            text-[14px]
            sm:text-base 
            md:text-lg 
            lg:text-l 
            text-[#D4D4D4]
            font-medium 
            max-w-3xl 
            mx-auto
            whitespace-nowrap 
            sm:whitespace-normal 
            animate-marquee
          ">
            India’s intelligent railway booking platform powered by AI prediction and real-time insights.
          </h3>
        </div>

      </div>
    </section>
  );
}

export default Hero;
