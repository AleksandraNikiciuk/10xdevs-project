import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-label-large font-medium transition-all duration-medium-2 transition-standard disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none overflow-hidden",
  {
    variants: {
      variant: {
        // Filled (Primary) - Highest emphasis
        default: "bg-md-primary text-md-on-primary shadow-md hover:shadow-lg",
        // Filled Tonal - Medium-high emphasis
        secondary: "bg-md-secondary-container text-md-on-secondary-container shadow-sm hover:shadow-md",
        // Filled Tonal (Tertiary) - Medium emphasis with different color
        tertiary: "bg-md-tertiary-container text-md-on-tertiary-container shadow-sm hover:shadow-md",
        // Outlined - Medium emphasis
        outline: "border-2 border-md-outline bg-transparent text-md-primary hover:bg-md-primary/8",
        // Text - Low emphasis
        ghost: "text-md-primary hover:bg-md-primary/8",
        // Destructive - For dangerous actions
        destructive: "bg-md-error text-md-on-error shadow-md hover:shadow-lg",
        // Link - Navigation
        link: "text-md-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5 shape-full has-[>svg]:px-4",
        sm: "h-9 px-4 py-2 shape-full text-label-medium has-[>svg]:px-3",
        lg: "h-12 px-8 py-3 shape-full has-[>svg]:px-6",
        icon: "size-10 shape-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
