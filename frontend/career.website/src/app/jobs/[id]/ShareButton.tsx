"use client";

import { Share2 } from "lucide-react";

export default function ShareButton() {
  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-brand-red border border-gray-200 rounded py-3 text-sm font-semibold transition-colors"
    >
      <Share2 size={16} />
      Share this Job
    </button>
  );
}
