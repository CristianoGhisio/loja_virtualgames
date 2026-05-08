import * as React from "react"
import { cn } from "@/components/ui/button"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-xs uppercase font-bold text-gray-500 tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-blue focus-visible:border-neon-blue/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 text-white appearance-none [&>option]:bg-[#1A1A1A] [&>option]:text-gray-300",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
