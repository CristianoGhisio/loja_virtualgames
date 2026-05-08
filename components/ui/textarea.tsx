import * as React from "react"
import { cn } from "@/components/ui/button"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-xs uppercase font-bold text-gray-500 tracking-wider ml-1">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-blue focus-visible:border-neon-blue/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 text-white",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
