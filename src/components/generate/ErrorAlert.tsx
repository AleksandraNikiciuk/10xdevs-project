import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ErrorState } from "./types";

interface ErrorAlertProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
  dataTestId?: string;
}

export function ErrorAlert({ error, onRetry, onDismiss, dataTestId }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" data-test-id={dataTestId}>
      <AlertCircle />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p>{error.message}</p>
        <div className="flex gap-2">
          {error.canRetry && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
