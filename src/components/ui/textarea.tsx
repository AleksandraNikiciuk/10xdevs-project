import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full shape-sm border-2 border-md-outline bg-md-surface-container text-md-on-surface placeholder:text-md-on-surface-variant px-4 py-3 text-body-large transition-all duration-medium-2 transition-standard outline-none focus-visible:border-md-primary aria-invalid:border-md-outline-variant disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
