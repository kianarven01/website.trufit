import React, { useRef, useState } from "react";
import { CarFront, Wrench, ShieldCheck, ArrowDownRight, ArrowUpRight, UserCheck, Cpu, Smile, Tag } from "lucide-react";
import { FaEnvelope, FaFacebookF, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Carousel from "@/components/ui/carousel";
import Navbar from "@/components/ui/site-navbar";
import Comments from "@/components/ui/comments";

import picBanner from "@/assets/images/pic-banner.jpg";
import picPeople from "@/assets/images/pic-people.jpg";
import picTrufitGate from "@/assets/images/pic-trufitgate.jpg";
import picTrufitFront from "@/assets/images/pic-trufitfront.jpeg"
import picRedSuzuki from "@/assets/images/pic-redsuzuki.png";
import picDtiLogo from "@/assets/images/pic-dtilogo.png";
import picBagwisLogo from "@/assets/images/pic-bagwislogo.png";
import picSuzukiLogo1 from "@/assets/images/pic-suzukilogo1.png";
import picSuzukiLogo2 from "@/assets/images/pic-suzukilogo2.png";
import picWurthLogo from "@/assets/images/pic-wurthlogo.png";
import picSplitFireLogo from "@/assets/images/pic-splitfirelogo.png";
import picCaltexLogo from "@/assets/images/pic-caltexlogo.png";

import picDiagnostics from "@/assets/images/pic-diagnostics.jpg";
import picMaintenance from "@/assets/images/pic-maintenance.png";
import picAircon from "@/assets/images/pic-aircon.png";
import picMechaRepair from "@/assets/images/pic-mecharepair.png";
import picUnderchassis from "@/assets/images/pic-underchassis.png";
import picDiesel from "@/assets/images/pic-diesel.png";
import picDetailing from "@/assets/images/pic-detailing.png";
import picOtherServices from "@/assets/images/pic-otherservices.png";

import picPromo2290 from "@/assets/images/pic-promo2290.png";
import picPromo2940 from "@/assets/images/pic-promo2940.png";
import picPromo3250 from "@/assets/images/pic-promo3250.png";
import picPromo4440 from "@/assets/images/pic-promo4440.png";
import picPromo4550 from "@/assets/images/pic-promo4550.png";
import picPromo5090 from "@/assets/images/pic-promo5090.png";
import picPromo5740 from "@/assets/images/pic-promo5740.png";
import picPromo5850 from "@/assets/images/pic-promo5850.png";
import picPromo50902 from "@/assets/images/pic-promo50902.png";
import picPromo58502 from "@/assets/images/pic-promo58502.png";

const services = [
  {
    img: picDiagnostics,
    title: "Diagnostic of Vehicle Electronics",
    desc: "Our expert technicians use advanced diagnostic tools to identify and resolve issues with your vehicle's electronic systems, ensuring optimal performance and safety.",
  },
  {
    img: picMaintenance,
    title: "Maintenance and Inspection",
    desc: "Our maintenance services include oil changes, filter replacements, and more to ensure your car runs smoothly.",
  },
  {
    img: picAircon,
    title: "Air Conditioning Services and Repair",
    desc: "Stay cool and comfortable with our AC services including system diagnostics, refrigerant recharging, and repairs.",
  },
  {
    img: picMechaRepair,
    title: "Mechanical Repair",
    desc: "Our skilled mechanics handle all types of mechanical repairs, from brakes and suspension to engine diagnostics.",
  },
  {
    img: picUnderchassis,
    title: "Underchassis Repair",
    desc: "Comprehensive underchassis repair including exhaust, rust treatment, and suspension work.",
  },
  {
    img: picDiesel,
    title: "Diesel Vehicle Repair",
    desc: "Covers fuel system diagnostics and engine repairs to keep diesel vehicles running efficiently.",
  },
  {
    img: picDetailing,
    title: "Interior and Exterior Detailing",
    desc: "Professional cleaning services including interior detailing, exterior washing, and waxing to protect your car's finish.",
  },
  {
    img: picOtherServices,
    title: "Other Allied Services",
    desc: "Additional services like tire rotation, battery testing, and fluid analysis to keep your vehicle in top condition.",
  },
];

const processes = [
  {
    icon: CarFront,
    title: "Comprehensive Vehicle Inspection",
    desc: "We thoroughly inspect your vehicle to identify issues and ensure accurate diagnostics.",
  },
  {
    icon: Wrench,
    title: "Professional Repair & Servicing",
    desc: "Our skilled technicians perform high-quality repairs and maintenance services.",
  },
  {
    icon: ShieldCheck,
    title: "Final Quality Control & Handover",
    desc: "We conduct final checks to ensure everything is perfect before handing back your vehicle.",
  },
];

const whyChooseUsItems = [
  {
    icon: UserCheck,
    title: "Experienced and Certified Technicians",
    desc: "Our team consists of highly skilled and certified professionals who ensure top-quality service on every vehicle.",
  },
  {
    icon: Cpu,
    title: "State-of-the-Art Equipment",
    desc: "We use advanced diagnostic and repair tools to accurately identify issues and perform precise maintenance.",
  },
  {
    icon: Smile,
    title: "Customer Satisfaction",
    desc: "We prioritize your experience and ensure every service exceeds expectations, making you drive away happy.",
  },
  {
    icon: Tag,
    title: "Competitive Pricing",
    desc: "Our services are priced fairly without compromising quality, giving you the best value for your investment.",
  },
];

const promoSlides: string[] = [
  picPromo2290,
  picPromo2940,
  picPromo3250,
  picPromo4440,
  picPromo4550,
  picPromo5090,
  picPromo5740,
  picPromo5850,
  picPromo50902,
  picPromo58502,
];

const Home: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section
        id="home"
        className="relative h-[680px] md:h-[750px] bg-slate-900 bg-cover bg-center flex items-center px-10 select-none"
        style={{ backgroundImage: `url(${picBanner})` }}
      >
        {/* darker overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* LEFT TEXT */}
        <div className="z-10 max-w-2xl text-white">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 italic">
            Precision That Powers Every Drive.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Whether you need routine maintenance or complex repairs, Trufit Auto
            Center is here to keep your vehicles in peak condition.
          </p>
          <button
            onClick={() => {
              const section = document.getElementById("book-appointment");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition"
          >
            Book an Appointment
          </button>
        </div>

        {/* TRUST BADGES - bottom left, bigger logos, logos bottom-aligned, text balanced */}
        <div className="absolute left-10 bottom-8 z-10 flex items-end gap-8">

          {/* Suzuki Authorized */}
          <div className="flex flex-col items-center text-center">
            <img
              src={picSuzukiLogo2}
              alt="Suzuki Authorized"
              draggable={false}
              className="h-20 md:h-24 w-auto object-contain opacity-90"
            />
            <span className="mt-2 h-6 md:h-7 text-sm md:text-base text-white/80 font-medium">
              Authorized Service Center
            </span>
          </div>

          {/* DTI 5 Star */}
          <div className="flex flex-col items-center text-center">
            <img
              src={picDtiLogo}
              alt="DTI 5 Star"
              draggable={false}
              className="h-20 md:h-24 w-auto object-contain opacity-90"
            />
            <span className="mt-2 h-6 md:h-7 text-sm md:text-base text-white/80 font-medium">
              5-Star Accreditation
            </span>
          </div>

          {/* Bagwis Seal */}
          <div className="flex flex-col items-center text-center">
            <img
              src={picBagwisLogo}
              alt="DTI Bagwis Seal"
              draggable={false}
              className="h-24 md:h-28 w-auto object-contain opacity-90"
            />
            {/* empty span to balance text heights */}
            <span className="mt-2 h-6 md:h-7"></span>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-10 select-none">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT COLUMN — ABOUT + QUALITY */}
          <div>
            <h2 className="text-4xl font-semibold border-b-4 border-red-600 inline-block mb-6">
              About Us
            </h2>

            <p className="text-gray-700 mb-8 leading-relaxed">
              At Trufit Auto Center, we take pride in offering a comprehensive range of
              top-notch automotive services to keep your vehicles running smoothly
              and looking their best. Our team of skilled technicians and mechanics
              is committed to providing the highest quality service and exceptional
              customer satisfaction.

              Text for dti accreditation
            </p>

            <h3 className="text-2xl font-semibold border-b-4 border-red-600 inline-block mb-4">
              Our Quality Service Promise
            </h3>

            <ul className="space-y-3">
              {[
                "Full safety inspection",
                "Precise diagnostics",
                "Honest, upfront pricing",
                "Fast, reliable service",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
                    ✓
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Services Section (click & drag) */}
      <section id="services" className="py-20 px-10 bg-gray-900 select-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <h2 className="text-4xl font-light text-white">Discover Our Services</h2>
          <p className="md:max-w-md text-white/80 md:text-right">
            Regular maintenance is crucial to prolonging the life of your car and preventing costly breakdowns.
          </p>
        </div>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {services.map((service, idx) => (
            <Card key={idx} className="max-w-xs bg-white rounded-2xl rounded-t-none shadow-md overflow-hidden flex-shrink-0 transform transition duration-300 hover:-translate-y-2">
              <img src={service.img} alt={service.title} draggable={false} onContextMenu={(e) => e.preventDefault()} 
              className="w-full h-40 object-cover pointer-events-none" />
              <CardHeader className="p-4 text-left">
                <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-left">
                <CardDescription className="text-base text-gray-600">{service.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Work Process Section */}
      <section id="work-process" className="py-20 px-10 select-none">
        <div className="w-full flex flex-col items-center">

          <h2 className="text-4xl font-semibold border-b-4 border-red-600 inline-block mb-12">
            Work Process
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">

            {processes.map((process, index) => {
              const Icon = process.icon;

              return (
                <div key={index} className="flex items-center">

                  {/* Card */}
                  <div className="w-72 bg-white rounded-xl shadow-lg p-6 text-center
                                  hover:-translate-y-2 transition duration-300">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center
                                    bg-gradient-to-br from-red-500 to-red-700
                                    rounded-xl shadow-lg">
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      {process.title}
                    </h3>

                    <p className="text-gray-600 text-sm">
                      {process.desc}
                    </p>
                  </div>

                  {/* Arrow */}
                  {index < processes.length - 1 && (
                    <div className="hidden md:flex mx-6 items-center">
                      {index % 2 === 0 ? (
                        <ArrowDownRight
                          className="w-10 h-10 text-red-600"
                          strokeWidth={2}
                        />
                      ) : (
                        <ArrowUpRight
                          className="w-10 h-10 text-red-600"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 px-10 bg-gray-900 select-none">
        <div className="w-full flex justify-center">
          <h2 className="text-4xl font-bold mb-12 text-white border-b-4 border-red-600 inline-block">
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {whyChooseUsItems.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center bg-white rounded-2xl p-6 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                {/* icon circle */}
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-md">
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-10 bg-gradient-to-b from-blue-400 to-blue-900 select-none">
        <div className="w-full flex flex-col items-center mb-10">
          <h2 className="text-4xl font-semibold mb-4 text-white text-center">
            What Our Customers Say
          </h2>
          <p className="text-white/80 text-center inline-block max-w-full text-lg sm:text-base md:text-lg lg:text-xl">
            Don't just take our word for it - hear from our satisfied customers who have experienced the Trufit Auto Center difference.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-start flex-wrap">
          <Comments
            name="Jane D."
            message="Trufit Auto Center handled my car perfectly and on time! Highly recommend."
            avatar={picPeople} 
            rating={5}
          />
          <Comments
            name="Mark S."
            message="Excellent service and friendly staff. My car has never run smoother."
            rating={4}
          />
          <Comments
            name="Lisa R."
            message="Professional, quick, and reliable. Will definitely return!"
            avatar={picPeople}
            rating={5}
          />
        </div>
      </section>

      {/* Special Promotion Section */}
      <section id="promo" className="py-20 px-10 bg-gray-900 select-none">
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-7xl mt-8">
            <Carousel slides={promoSlides} />
          </div>
        </div>
      </section>

      <section id="trusted-brands" className="py-20 px-10 select-none">
        <div className="w-full flex flex-col items-center">
          <h2 className="text-4xl font-semibold mb-4 text-center">
            Trusted by Leading Brands
          </h2>
          <p className="text-gray-700 text-center max-w-3xl mb-10 text-lg sm:text-base md:text-lg lg:text-xl">
            We are proud to be the trusted service provider for a wide range of leading automotive brands, ensuring that your vehicle receives the best care possible.
          </p>

          {/* horizontal logo row */}
          <div className="flex justify-center items-center gap-6 flex-wrap lg:flex-nowrap w-full max-w-4xl mx-auto">
            <img
              src={picSuzukiLogo2}
              alt="Suzuki Logo 2"
              draggable={false} onContextMenu={(e) => e.preventDefault()} 
              className="max-w-[150px] sm:max-w-[180px] md:max-w-[170px] h-auto object-contain pointer-events-none"
            />
            <img
              src={picWurthLogo}
              alt="Wurth Logo"
              draggable={false} onContextMenu={(e) => e.preventDefault()} 
              className="max-w-[150px] sm:max-w-[180px] md:max-w-[200px] h-auto object-contain pointer-events-none"
            />
            <img
              src={picSplitFireLogo}
              alt="Split Fire Logo"
              draggable={false} onContextMenu={(e) => e.preventDefault()} 
              className="max-w-[180px] sm:max-w-[200px] md:max-w-[250px] h-auto object-contain pointer-events-none"
            />
            <img
              src={picCaltexLogo}
              alt="Caltex Logo"
              draggable={false} onContextMenu={(e) => e.preventDefault()} 
              className="max-w-[180px] sm:max-w-[200px] md:max-w-[350px] h-auto object-contain pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* Book Appointment Section */}
      <section
        id="book-appointment"
        className="relative py-20 px-10 bg-cover bg-center select-none"
        style={{ backgroundImage: `url(${picTrufitGate})` }}
      >
        {/* darker overlay */}
        <div className="absolute inset-0 bg-black/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">

          {/* LEFT SIDE - APPOINTMENT INPUTS (no box) */}
          <div className="flex-1 text-white">

            <h3 className="text-sm uppercase tracking-wide text-red-500 mb-2">
              Need a hand?
            </h3>
            <h2 className="text-4xl font-semibold mb-8">
              Book an appointment now!
            </h2>

            <div className="space-y-6 max-w-md">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            {/* Phone + Email side by side */}
            <div className="flex gap-4">
              <input
                type="tel"
                placeholder="Phone Number"
                className="flex-1 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="date"
                className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="time"
                className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
              <button className="w-full bg-red-600 hover:bg-red-700 transition rounded py-3 font-semibold uppercase tracking-wide">
                Book Now
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - IMAGE + CONTACT BOX */}
          <div className="flex-1 max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">

            {/* top image */}
            <img
              src={picPeople}
              alt="Trufit Location"
              draggable={false} onContextMenu={(e) => e.preventDefault()}
              className="w-full h-48 object-cover pointer-events-none"
            />

            {/* contact info */}
              <div className="p-6 text-gray-800 space-y-4">
                <h3 className="text-2xl font-semibold">Contact Us</h3>

                {/* address */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 p-2 rounded-full text-white hover:scale-110 transition"
                  >
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </a>
                  <span>1042 Vinzons Ave, P1 Brgy. Gahonon Daet, Camarines Norte</span>
                </div>

                {/* phone */}
                <div className="flex items-center gap-3">
                  <a
                    href="tel:09187747788"
                    className="bg-green-600 p-2 rounded-full text-white hover:scale-110 transition"
                  >
                    <FaPhoneAlt className="w-4 h-4" />
                  </a>
                  <span>0918-774-7788</span>
                </div>

                {/* email */}
                <div className="flex items-center gap-3">
                  <a
                    href="mailto:trufitautocenterdaet@gmail.com"
                    className="bg-red-500 p-2 rounded-full text-white hover:scale-110 transition"
                  >
                    <FaEnvelope className="w-4 h-4" />
                  </a>
                  <span>trufitautocenterdaet@gmail.com</span>
                </div>

                {/* facebook */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/ac.trufit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-2 rounded-full text-white hover:scale-110 transition"
                  >
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                  <span>Trufit Daet</span>
                </div>

            </div>
          </div>

        </div>
      </section>

      {/* Track Progress Section */}
      <section id="track-progress" className="py-20 px-10 bg-gray-100 select-none">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* LEFT TEXT & RIGHT INPUT */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* LEFT TEXT */}
            <div className="md:w-2/3 text-gray-700">
              <h3 className="text-2xl font-semibold mb-2">Need a Status Update?</h3>
              <p className="text-gray-600">
                Check the current stage of your vehicle’s service anytime, anywhere.
              </p>
            </div>

            {/* RIGHT INPUT + BUTTON */}
            <div className="md:w-1/3 flex gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Enter your tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-semibold transition">
                Track
              </button>
            </div>
          </div>

          {/* INFO DROPDOWN */}
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
              trackingNumber.trim() ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="w-full bg-white rounded-lg p-6 text-gray-700 text-center shadow-lg mt-4">
              Tracking information for <strong>{trackingNumber}</strong> will appear here.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section id="footer" className="py-10 px-10 bg-slate-900 text-gray-400 text-center select-none">
        <p>&copy; {new Date().getFullYear()} Trufit Auto Center. All rights reserved.</p>
      </section>
    </main>
  );
};

export default Home;
