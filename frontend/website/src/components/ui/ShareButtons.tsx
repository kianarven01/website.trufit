"use client";

import { useState } from "react";

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const shareText = "Check out TruFit Auto Center!";

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const getUrl = () =>
    typeof window !== "undefined"
      ? window.location.href
      : "https://trufitautocenter.com";

  const showToast = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const openAppOrFallback = (appUrl: string, webUrl: string) => {
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
    const url = getUrl();

    try {
      await navigator.clipboard.writeText(url);
      showToast();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
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

      <div className="flex items-center gap-3">
        {/* facebook */}
        <button onClick={handleFacebook} className="text-gray-400 hover:text-white">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* messenger */}
        <button onClick={handleMessenger} className="text-gray-400 hover:text-white">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.02 2 11c0 2.84 1.49 5.38 3.82 7.06V22l3.37-1.85c.9.25 1.85.39 2.81.39 5.52 0 10-4.02 10-9s-4.48-9-10-9zm1.1 12.6l-2.55-2.72-5.05 2.72 5.55-5.9 2.55 2.72 5.05-2.72-5.55 5.9z"/>
          </svg>
        </button>

        {/* twitter */}
        <button onClick={handleTwitter} className="text-gray-400 hover:text-white">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.46 6c-.77.35-1.5.58-2.3.69a4.1 4.1 0 001.8-2.27 8.2 8.2 0 01-2.6 1 4.08 4.08 0 00-7 3.72A11.6 11.6 0 013 4.8a4.07 4.07 0 001.26 5.44 4 4 0 01-1.85-.5v.05a4.08 4.08 0 003.27 4 4.1 4.1 0 01-1.84.07 4.08 4.08 0 003.8 2.83A8.2 8.2 0 012 19.54a11.6 11.6 0 006.29 1.84c7.55 0 11.68-6.25 11.68-11.67v-.53c.8-.58 1.5-1.3 2.06-2.18z"/>
          </svg>
        </button>

        {/* copy */}
        <button onClick={handleCopy} className="text-gray-400 hover:text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 9h10v10H9V9z"/>
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/>
          </svg>
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