"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Facebook, MessageCircle, Twitter, Copy } from "lucide-react";

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);
  
  const shareText = "Check out TRUFIT Auto Center!";

  const getUrl = () =>
    typeof window !== "undefined"
      ? window.location.href
      : "https://trufitautocenter.com";

  const showToast = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const openAppOrFallback = (appUrl: string, webUrl: string) => {
    if (typeof navigator === "undefined") {
      window.open(webUrl, "_blank");
      return;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) {
      window.open(webUrl, "_blank");
      return;
    }

    let hidden = false;

    const fallback = setTimeout(() => {
      if (!hidden) window.open(webUrl, "_blank");
    }, 1200);

    const onVisibilityChange = () => {
      if (document.hidden) {
        hidden = true;
        clearTimeout(fallback);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    window.location.href = appUrl;
  };

  const handleFacebook = () => {
    const url = getUrl();
    openAppOrFallback(
      `fb://facewebmodal/f?href=${encodeURIComponent(url)}`,
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    );
  };

  const handleMessenger = () => {
    const url = getUrl();
    openAppOrFallback(
      `fb-messenger://share?link=${encodeURIComponent(url)}`,
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        url
      )}&redirect_uri=${encodeURIComponent(url)}`
    );
  };

  const handleTwitter = () => {
    const url = getUrl();
    openAppOrFallback(
      `twitter://post?message=${encodeURIComponent(shareText + " " + url)}`,
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(shareText)}`
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      showToast();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = getUrl();
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      showToast();
    }
  };

  return (
    <div className="relative flex flex-col items-start gap-3">
      <span className="text-white text-xs uppercase tracking-widest">
        share this on
      </span>

      <div className="flex items-center gap-1">
      
        {/* facebook */}
        <button onClick={handleFacebook} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-red shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all">
        <Facebook className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* messenger */}
        <button onClick={handleMessenger} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-red shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all">
        <MessageCircle className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* twitter */}
        <button onClick={handleTwitter} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-red shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all">
        <Twitter className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* copy */}
        <button onClick={handleCopy} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-red shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:text-white hover:border-white/30 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all">
        <Copy className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* TOAST */}
      <div
        className={`absolute left-0 -bottom-8 text-xs bg-white/10 text-white px-3 py-1 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300
        ${copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        Link Copied
      </div>
    </div>
  );
}