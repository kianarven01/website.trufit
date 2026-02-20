import React from "react";

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-slate-900 flex items-center px-10">
        <div className="z-10 max-w-2xl text-white">
          <h1 className="text-5xl font-bold leading-tight mb-4 italic">
            Precision That Powers Every Drive.
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Whether you need routine maintenance or complex repairs, Trufit Auto
            Center is here to keep your vehicles in peak condition.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition">
            Book an Appointment
          </button>
        </div>

        {/* Placeholder for that Red Suzuki Image */}
        <div className="absolute right-10 bottom-0 w-1/2">
          <p className="text-gray-500 text-right opacity-50">
            [Suzuki S-Presso Image Goes Here]
          </p>
        </div>
      </section>

      {/* About Section Placeholder */}
      <section id="about" className="py-20 px-10">
        <h2 className="text-3xl font-bold border-b-4 border-red-600 inline-block mb-6">
          About Us
        </h2>
        <p className="text-gray-700 max-w-3xl">
          At Trufit Auto Center, we take pride in offering a comprehensive range
          of top-notch automotive services...
        </p>
      </section>
    </main>
  );
};

export default Home;
