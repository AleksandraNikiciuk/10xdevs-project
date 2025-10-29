"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-6 shrink-0 rounded-sm border-2 border-md-outline bg-transparent data-[state=checked]:bg-md-primary data-[state=checked]:text-md-on-primary data-[state=checked]:border-md-primary aria-invalid:border-md-error transition-all duration-medium-2 transition-standard outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-md-primary/50 focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-4" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
