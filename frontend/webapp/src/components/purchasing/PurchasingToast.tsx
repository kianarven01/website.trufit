import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type PurchasingToastType = "success" | "warning" | "error" | "info";

interface PurchasingToastProps {
  type: PurchasingToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const toastStyles = {
  success: {
    wrapper:
      "bg-green-50 border-green-200 border-l-green-700 dark:bg-green-900/20 dark:border-green-800/40 dark:border-l-green-400",
    icon: "text-green-700 dark:text-green-400",
    Icon: CheckCircle2,
  },
  warning: {
    wrapper:
      "bg-yellow-50 border-yellow-200 border-l-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800/40 dark:border-l-yellow-400",
    icon: "text-yellow-700 dark:text-yellow-400",
    Icon: AlertTriangle,
  },
  error: {
    wrapper:
      "bg-red-50 border-red-200 border-l-red-700 dark:bg-red-900/20 dark:border-red-800/40 dark:border-l-red-400",
    icon: "text-red-700 dark:text-red-400",
    Icon: XCircle,
  },
  info: {
    wrapper:
      "bg-blue-50 border-blue-200 border-l-blue-700 dark:bg-blue-900/20 dark:border-blue-800/40 dark:border-l-blue-400",
    icon: "text-blue-700 dark:text-blue-400",
    Icon: Info,
  },
};

const PurchasingToast = ({
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: PurchasingToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const style = toastStyles[type];
  const Icon = style.Icon;

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 20);
    const hideTimer = window.setTimeout(() => setIsVisible(false), duration);
    const closeTimer = window.setTimeout(() => onClose(), duration + 300);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    window.setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className={`fixed left-1/2 top-6 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transform transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
      }`}
    >
      <div className={`rounded-md border border-l-4 p-4 shadow-lg backdrop-blur ${style.wrapper}`} role="alert">
        <div className="flex items-start gap-2.5">
          <Icon className={`mt-0.5 size-[18px] ${style.icon}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight text-slate-900 dark:text-slate-50">{title}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{message}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss alert"
            className="ml-auto rounded opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={handleClose}
          >
            <X className="size-3 text-slate-500 dark:text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasingToast;
