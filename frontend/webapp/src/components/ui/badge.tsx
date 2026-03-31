import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",

        // CUSTOM for status
        pending: "border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
        approved: "border-emerald-600/30 bg-emerald-400/10 text-emerald-500 hover:bg-emerald-400/20",
        "in-transit": "border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20",
        received: "border-blue-600/30 bg-blue-600/10 text-blue-700 hover:bg-blue-600/20",
        cancelled: "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20",
        "for-approval": "border-yellow-500/30 bg-yellow-400/10 text-yellow-500 hover:bg-yellow-500/20",
        delivered: "border-teal-500/30 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20",    

        vehicles: "border-sky-500/30 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
