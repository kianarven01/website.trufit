"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { promo, Promo } from "@/data/promopopup";

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Promo>(promo[0]);

  // show popup automatically after 10 seconds if not dismissed
  useEffect(() => {
    const neverShowAgain = localStorage.getItem("promoNeverShow");
    const lastDismissed = localStorage.getItem("promoDismissedAt");
    const now = new Date().getTime();

    if (neverShowAgain === "true") return;

    const isReadyToShow =
      !lastDismissed || now - parseInt(lastDismissed) > 259200000; // 3 days

    if (isReadyToShow) {
      const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
        handleOpen();
      }, 10000); // 10 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    setIsOpen(false);
    if (typeof document !== "undefined") document.body.style.overflow = "unset";
    localStorage.setItem("promoDismissedAt", new Date().getTime().toString());
  };

  const handlePermanentClose = () => {
    setIsOpen(false);
    if (typeof document !== "undefined") document.body.style.overflow = "unset";
    localStorage.setItem("promoNeverShow", "true");
  };

  return (
    <>
      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
          {/* overlay (no onClick now) */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] animate-fadeIn" />

          {/* modal box */}
          <div className="relative flex w-full max-w-xl max-h-[90dvh] sm:max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl animate-show transform transition-all">
            
            {/* permanent close button */}
            <button
              onClick={handlePermanentClose}
              aria-label="Close modal"
              className="absolute right-3 top-3 z-20 text-gray-400 hover:text-red-600 transition-colors bg-white/80 rounded-full p-1"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* LEFT COLUMN */}
            <div className="hidden md:flex w-[35%] flex-col items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border-r border-gray-100 p-6 shrink-0">
              <img
                src="/images/partners/splitfire.webp"
                alt="Splitfire Logo"
                className="w-full max-w-[100px] h-auto object-contain mb-4"
              />
              <div className="relative w-full transition-transform duration-700 hover:scale-110">
                <img
                  src="/images/promopopup/oil-bottle.png"
                  alt="Synthetic Oil Bottle"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
              <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Authorized Distributor
              </p>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-1 flex-col items-center p-5 sm:p-7 text-center bg-white justify-start overflow-y-auto custom-scrollbar">
              {/* Promo Label */}
              <div className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 shrink-0">
                Premium Service Pack
              </div>

              <h3 className="text-xl font-[900] uppercase tracking-tight text-[#1a1a1a] leading-tight shrink-0">
                5W-40 Fully Synthetic
              </h3>

              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 shrink-0">
                Oil Change Service
              </p>

              {/* VEHICLE SELECT */}
              <div className="w-full mb-5 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 text-center">
                  Select Your Vehicle Type
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 px-1">
                  {promo.map((p) => {
                    const isSelected = selectedVehicle.name === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => setSelectedVehicle(p)}
                        className={`
                          relative flex flex-col items-center justify-center px-1 py-2.5 
                          rounded-xl border-2 transition-all duration-300 w-full
                          ${isSelected 
                            ? "border-blue-600 bg-blue-50/40 ring-4 ring-blue-600/10 scale-105 z-10" 
                            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                          }
                        `}
                      >
                        <span className={`text-[8px] md:text-[9px] font-black uppercase leading-tight text-center ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
                          {p.name}
                        </span>
                        
                        <span className={`text-[9px] md:text-[10px] font-black mt-1 ${isSelected ? "text-red-600" : "text-gray-400"}`}>
                          ₱{p.price.toLocaleString()}
                        </span>
                        
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-0.5 shadow-lg shadow-blue-600/30">
                            <CheckCircle2 size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INCLUSIONS */}
              <div className="w-full max-w-[340px] mb-3 border-y border-gray-100 py-2 shrink-0">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5 text-center">
                  Inclusions
                </p>
                <div className="flex flex-row justify-center items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase">
                    <CheckCircle2 size={11} className="text-blue-600" /> Engine Oil
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase">
                    <CheckCircle2 size={11} className="text-blue-600" /> Oil Filter
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase">
                    <CheckCircle2 size={11} className="text-blue-600" /> Labor
                  </div>
                </div>
              </div>

              {/* CLAIM BUTTONS */}
              <div className="w-full shrink-0 pb-2">
                <button
                  onClick={() => {
                    handleClose();
                    if (window.location.hash === "#appointment") window.location.hash = "";
                    window.location.hash = "appointment";
                    const event = new CustomEvent("claimOffer", {
                      detail: {
                        vehicle: selectedVehicle.name,
                        price: selectedVehicle.price,
                        service: "oil-change",
                      },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full bg-red-600 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-red-600/20"
                >
                  Claim This Offer
                </button>

                <button
                  onClick={handleClose}
                  className="mt-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <p className="mt-2.5 text-[8px] font-bold uppercase tracking-widest text-gray-200 shrink-0">
                Limited Time Promotion Only
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        /* custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        /* modal popup animation */
        @keyframes showModal {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-show {
          animation: showModal 0.5s forwards ease-out;
        }

        /* overlay fade-in */
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards ease-out;
        }
      `}</style>
    </>
  );
}