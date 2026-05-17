import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  shape?: 'default' | 'rounded' | 'pill';
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-neon-blue text-black font-bold hover:bg-neon-blue-dark hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] active:scale-[0.98]',
  secondary:
    'bg-cta-gold text-black font-bold hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98]',
  outline:
    'border border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue/60 active:scale-[0.98]',
  ghost:
    'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 active:scale-[0.98]',
  neon:
    'bg-neon-blue text-black font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] hover:bg-neon-blue-dark active:scale-[0.98]',
  glass:
    'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-white backdrop-blur-md hover:bg-[rgba(255,255,255,0.08)] hover:border-white/20 active:scale-[0.98]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
  md: 'px-5 py-2.5 text-sm gap-2 h-10',
  lg: 'px-7 py-3.5 text-base gap-2.5 h-12',
  icon: 'h-9 w-9 p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', shape = 'rounded', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 tracking-wide cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-neon-blue focus-visible:outline-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          // eslint-disable-next-line security/detect-object-injection
          variantStyles[variant],
          // eslint-disable-next-line security/detect-object-injection
          sizeStyles[size],
          {
            'rounded-lg': shape === 'default',
            'rounded-xl': shape === 'rounded',
            'rounded-full': shape === 'pill',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, cn };
