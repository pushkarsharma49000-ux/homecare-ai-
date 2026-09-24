import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a67c45] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-[#22201c] text-white hover:bg-[#3a352d] shadow-sm',
      secondary: 'bg-[#eee8dd] text-[#312d27] hover:bg-[#e4dacb] border border-[#dfd4c4]',
      outline: 'bg-white text-[#494239] border border-[#d8cdbd] hover:bg-[#faf7f1] shadow-sm',
      ghost: 'bg-transparent text-[#625a50] hover:bg-[#eee8dd] hover:text-[#24211d]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      subtle: 'bg-[#f6eddf] text-[#795a2f] hover:bg-[#eddfca] border border-[#ead7ba]',
    };

    const sizes = {
      sm: 'text-xs h-8 px-3 gap-1.5',
      md: 'text-sm h-9 px-4 gap-2',
      lg: 'text-base h-11 px-5 gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
