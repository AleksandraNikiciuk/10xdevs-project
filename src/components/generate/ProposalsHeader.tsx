import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProposalsHeaderProps {
  totalCount: number;
  selectedCount: number;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isSaveDisabled: boolean;
}

export function ProposalsHeader({
  totalCount,
  selectedCount,
  onSave,
  onCancel,
  isSaving,
  isSaveDisabled,
}: ProposalsHeaderProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelClick = () => {
    if (selectedCount > 0) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancel();
  };

  return (
    <div data-test-id="proposals-header">
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        data-test-id="proposals-header-summary"
      >
        <div className="text-body-medium text-md-on-surface-variant" data-test-id="proposals-selection-counter">
          Selected: <span className="text-label-large text-md-on-surface">{selectedCount}</span> / {totalCount}{" "}
          flashcards
        </div>
        <div className="flex gap-3" data-test-id="proposals-header-actions">
          <Button
            variant="outline"
            onClick={handleCancelClick}
            disabled={isSaving}
            data-test-id="cancel-generation-button"
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaveDisabled || isSaving} data-test-id="save-selected-button">
            {isSaving ? "Saving..." : `Save Selected (${selectedCount})`}
          </Button>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog} data-test-id="cancel-generation-dialog">
        <DialogContent data-test-id="cancel-generation-dialog-content">
          <DialogHeader>
            <DialogTitle>Cancel Generation?</DialogTitle>
            <DialogDescription>
              You have {selectedCount} flashcard{selectedCount !== 1 ? "s" : ""} selected. Are you sure you want to
              cancel? All unsaved proposals will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              data-test-id="cancel-dialog-keep-editing-button"
            >
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} data-test-id="cancel-dialog-confirm-button">
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
