import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neon-blue/15 text-neon-blue",
        secondary:
          "border-transparent bg-white/5 text-gray-300",
        destructive:
          "border-transparent bg-red-500/15 text-red-400",
        success:
          "border-transparent bg-green-500/15 text-green-400",
        warning:
          "border-transparent bg-yellow-500/15 text-yellow-400",
        outline:
          "border-[rgba(255,255,255,0.1)] text-gray-300",
        neon:
          "border-neon-blue/40 text-neon-blue bg-neon-blue/5 shadow-[0_0_8px_rgba(0,212,255,0.15)]",
        purple:
          "border-neon-purple/40 text-neon-purple bg-neon-purple/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
