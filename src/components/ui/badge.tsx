import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center shape-xs px-3 py-1 text-label-small w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-md-primary-container text-md-on-primary-container",
        secondary: "bg-md-secondary-container text-md-on-secondary-container",
        tertiary: "bg-md-tertiary-container text-md-on-tertiary-container",
        destructive: "bg-md-error-container text-md-on-error-container",
        outline: "border border-md-outline bg-transparent text-md-on-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
