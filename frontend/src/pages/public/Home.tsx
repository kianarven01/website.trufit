import React, {useState} from "react";
import { FaEnvelope, FaFacebookF, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Carousel from "@/components/ui/carousel";
import Navbar from "@/components/ui/site-navbar";
import Comments from "@/components/ui/comments";

import picPeople from "@/assets/images/pic-people.jpg";
import picTrufitGate from "@/assets/images/pic-trufitgate.jpg";
import picTrufitFront from "@/assets/images/pic-trufitfront.jpeg"
import picRedSuzuki from "@/assets/images/pic-redsuzuki.png";
import picSuzukiLogo1 from "@/assets/images/pic-suzukilogo1.png";
import picSuzukiLogo2 from "@/assets/images/pic-suzukilogo2.png";
import picWurthLogo from "@/assets/images/pic-wurthlogo.png";
import picSplitFireLogo from "@/assets/images/pic-splitfirelogo.png";

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
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section id="home" 
      className="relative h-[600px] bg-slate-900 flex items-center px-10 select-none"
      style={{ backgroundImage: `url(${picTrufitGate})` }}>

        {/* darker overlay */}
        <div className="absolute inset-0 bg-black/80"></div>
        
        <div className="z-10 max-w-2xl text-white">
          <h1 className="text-5xl font-bold leading-tight mb-4 italic">
            Precision That Powers Every Drive.
          </h1>
          <p className="text-lg text-gray-300 mb-8">
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

        {/* Red Suzuki S-Presso */}
        <div className="absolute right-10 bottom-0 w-1/2">
          <img src={picRedSuzuki} 
          alt="Red Suzuki S-Presso" 
          className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-10 select-none">
        <h2 className="text-4xl font-semibold border-b-4 border-red-600 inline-block mb-6">
          About Us
        </h2>
        <p className="text-gray-700 max-w-3xl">
          At Trufit Auto Center, we take pride in offering a comprehensive range of top-notch automotive services to keep your vehicles running smoothly and looking their best. Our team of skilled technicians and mechanics is committed to providing the highest quality service and exceptional customer satisfaction. Trust us with your automobile needs, and we guarantee you'll drive away with a smile!
        </p>

        {/* Quality Service Promise */}
        <h3 className="text-2xl font-semibold border-b-4 border-red-600 inline-block mt-10 mb-4">
          Our Quality Service Promise
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Full safety inspection</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Precise diagnostics</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Honest, upfront pricing</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span>Fast, reliable service</span>
          </li>
        </ul>

        {/* Suzuki Authorized Service Station Certification */}
        <div className="flex flex-col items-center mt-10 select-none">
          <p className="text-center font-bold text-gray-700 text-sm mb-4">
            CERTIFIED AS SUZUKI AUTHORIZED SERVICE STATION
          </p>
          <img src={picSuzukiLogo1} 
          alt="Suzuki Logo 1" 
          className="w-48 sm:w-56 md:w-64 h-auto object-contain" 
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-10 bg-gradient-to-b from-blue-400 to-blue-900 select-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <h2 className="text-4xl font-light text-white">
            Discover Our Services
          </h2>
          <p className="md:max-w-md text-white/80 md:text-right">
            Regular maintenance is crucial to prolonging the life of your car and preventing costly breakdowns.
          </p>
        </div>
        
        <div className="flex overflow-x-auto gap-6 py-4 
                        [&::-webkit-scrollbar]:hidden 
                        [-ms-overflow-style:none] 
                        [scrollbar-width:none]">

          {/* Service Card 1: Diagnostic of Vehicle Electronics */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picDiagnostics} alt="Diagnostic of Vehicle Electronics" 
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4"> 
              <CardTitle className="text-lg font-semibold">
                Diagnostic of Vehicle Electronics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Our expert technicians use advanced diagnostic tools to identify and resolve issues with your vehicle's electronic systems, ensuring optimal performance and safety.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 2: Maintenance and Inspection */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picMaintenance} alt="Maintenance and Inspection"
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4"> 
              <CardTitle className="text-lg font-semibold">
                Maintenance and Inspection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Regular maintenance is essential for keeping your vehicle in top condition. Our maintenance services include oil changes, filter replacements, and more to ensure your car runs smoothly.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 3: Air Conditioning Services and Repair */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picAircon} alt="Air Conditioning Services and Repair"
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4"> 
              <CardTitle className="text-lg font-semibold">
                Air Conditioning Services and Repair
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Stay cool and comfortable with our air conditioning services. We offer AC system diagnostics, refrigerant recharging, and repairs to keep your vehicle's climate control functioning perfectly.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 4: Mechanical Repair */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picMechaRepair} alt="Mechanical Repair"
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Mechanical Repair
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Our skilled mechanics handle all types of mechanical repairs, from brake and suspension work to engine diagnostics and component replacements.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 5: Underchassis Repair */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picUnderchassis} alt="Underchassis Repair"
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Underchassis Repair
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                We provide comprehensive underchassis repair services, including exhaust system repairs, rust treatment, and suspension work to ensure your vehicle's structural integrity and performance.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 6: Diesel Vehicle Repair */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picDiesel} alt="Diesel Vehicle Repair"
            className="w-full h-40 object-cover"
            />
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Diesel Vehicle Repair
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Our diesel repair services cover everything from fuel system diagnostics to engine repairs, ensuring your diesel vehicle runs efficiently and reliably.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 7: Interior and Exterior Detailing */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picDetailing} alt="Interior and Exterior Detailing"
            className="w-full h-40 object-cover"
            />
             <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Interior and Exterior Detailing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                Keep your vehicle looking its best with our professional cleaning services, including interior detailing, exterior washing, and waxing to protect your car's finish.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Card 8: Other Services */}
          <Card className="max-w-xs bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
            <img 
            src={picOtherServices} alt="Other Allied Services"
            className="w-full h-40 object-cover"
            />
             <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                Other Allied Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CardDescription className="text-sm text-gray-600">
                We also offer a wide range of additional services to keep your vehicle in top condition, including tire rotation, battery testing, and fluid analysis.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Work Process Section */}
      <section id="work-process" className="py-20 px-10 select-none">
        <div className="w-full flex justify-center">
          <h2 className="text-4xl font-semibold border-b-4 border-red-600 inline-block mb-6">
            Work Process
          </h2>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 px-10 select-none">
        <div className="w-full flex justify-center">
          <h2 className="text-4xl font-semibold border-b-4 border-red-600 inline-block mb-6">
            Why Choose Us
          </h2>
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
      <section id="promo" className="py-20 px-10 bg-gray-100 select-none">
        <div className="w-full flex flex-col items-center">
          <h2 className="text-4xl font-semibold mb-4 text-center">
            Special Promotion
          </h2>
          <p className="text-gray-700 text-center inline-block max-w-full text-lg sm:text-base md:text-lg lg:text-xl">
            For a limited time! Book your appointment today and experience the exceptional care and quality that Trufit Auto Center is known for.
          </p>
          <div className="w-full max-w-4xl mt-8">
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
          <div className="flex justify-center items-center gap-6 flex-wrap w-full max-w-4xl">
            <img
              src={picSuzukiLogo2}
              alt="Suzuki Logo 2"
              className="flex-1 max-w-[150px] sm:max-w-[180px] md:max-w-[200px] h-auto object-contain"
            />
            <img
              src={picWurthLogo}
              alt="Wurth Logo"
              className="flex-1 max-w-[150px] sm:max-w-[180px] md:max-w-[200px] h-auto object-contain"
            />
            <img
              src={picSplitFireLogo}
              alt="Split Fire Logo"
              className="flex-1 max-w-[150px] sm:max-w-[180px] md:max-w-[200px] h-auto object-contain"
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
              className="w-full h-48 object-cover"
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
                  <span>1042 Vinsons Ave, P1 Brgy. Gahonon Daet, Camarines Norte</span>
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
