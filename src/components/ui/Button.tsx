"use client";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utlis";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-blue-700 focus-visible:ring-[#573CFA]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",  
        secondary:
          "bg-[#E5E7EB] text-black hover:bg-[#D9D9D9] focus-visible:ring-[#FB8D1A]",
        success:
          "bg-[#02864A] text-white hover:bg-[#03A15C] focus-visible:ring-[#02864A]",
        danger:
          "bg-[#E8083E] text-white hover:bg-[#F03C65] focus-visible:ring-[#E8083E]",
        neutral:
          "bg-[#1C1A27] text-white hover:bg-[#2F2D3A] focus-visible:ring-[#1C1A27]",
        outline:
          "border border-[#573CFA] text-[#573CFA] bg-transparent hover:bg-[#f3f0ff] focus-visible:ring-[#573CFA]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",  
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

// Usage examples:
// <Button variant="secondary">Secondary Action</Button>
// <Button variant="success">Confirm</Button>
// <Button variant="danger">Delete</Button>
// <Button variant="neutral">Cancel</Button>
