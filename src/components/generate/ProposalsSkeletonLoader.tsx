import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProposalsSkeletonLoader() {
  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <Loader2 className="h-10 w-10 animate-spin text-md-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-title-large text-md-on-surface">Generating flashcards...</h3>
          <p className="text-body-medium text-md-on-surface-variant">
            AI is analyzing your text and creating learning cards
          </p>
        </div>
      </div>

      {/* Skeleton Cards in Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pl-[52px]">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
