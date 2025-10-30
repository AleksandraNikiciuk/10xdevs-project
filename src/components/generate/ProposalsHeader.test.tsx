import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { ProposalsHeader } from "@/components/generate/ProposalsHeader";

const { wrap } = vi.hoisted(() => ({
  wrap: (children: React.ReactNode) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dialog", () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => wrap(children);

  const Dialog = ({ open, children }: { open?: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null;

  return {
    Dialog,
    DialogContent: Wrapper,
    DialogDescription: Wrapper,
    DialogFooter: Wrapper,
    DialogHeader: Wrapper,
    DialogTitle: Wrapper,
  };
});

describe("ProposalsHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders selection summary and triggers save", () => {
    const handleSave = vi.fn();

    render(
      <ProposalsHeader
        totalCount={5}
        selectedCount={2}
        onSave={handleSave}
        onCancel={vi.fn()}
        isSaving={false}
        isSaveDisabled={false}
      />
    );

    expect(screen.getByText(/Selected:/i)).toHaveTextContent("Selected: 2 / 5 flashcards");

    const saveButton = screen.getByRole("button", { name: "Save Selected (2)" });
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("disables actions and shows saving state while saving", () => {
    render(
      <ProposalsHeader
        totalCount={4}
        selectedCount={3}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSaving={true}
        isSaveDisabled={false}
      />
    );

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("does not submit save when disabled", () => {
    const handleSave = vi.fn();

    render(
      <ProposalsHeader
        totalCount={3}
        selectedCount={1}
        onSave={handleSave}
        onCancel={vi.fn()}
        isSaving={false}
        isSaveDisabled={true}
      />
    );

    const saveButton = screen.getByRole("button", { name: "Save Selected (1)" });
    expect(saveButton).toBeDisabled();

    fireEvent.click(saveButton);
    expect(handleSave).not.toHaveBeenCalled();
  });

  it("invokes cancel immediately when nothing is selected", () => {
    const handleCancel = vi.fn();

    render(
      <ProposalsHeader
        totalCount={2}
        selectedCount={0}
        onSave={vi.fn()}
        onCancel={handleCancel}
        isSaving={false}
        isSaveDisabled={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Cancel Generation/i)).not.toBeInTheDocument();
  });

  it("confirms cancel via dialog when selections exist", () => {
    const handleCancel = vi.fn();

    render(
      <ProposalsHeader
        totalCount={4}
        selectedCount={2}
        onSave={vi.fn()}
        onCancel={handleCancel}
        isSaving={false}
        isSaveDisabled={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).not.toHaveBeenCalled();
    expect(screen.getByText(/Cancel Generation/)).toBeInTheDocument();
    expect(screen.getByText(/You have 2 flashcards selected/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Yes, Cancel" }));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    expect(screen.queryByText(/Cancel Generation/)).not.toBeInTheDocument();
  });
});
