import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProposalCard } from "@/components/generate/ProposalCard";
import type { ProposalViewModel } from "@/components/generate/types";

const createProposal = (overrides: Partial<ProposalViewModel> = {}): ProposalViewModel => ({
  id: 1,
  question: "What is Astro?",
  answer: "Astro is a web framework",
  source: "ai-full",
  generation_id: 1,
  created_at: "2024-01-01T00:00:00.000Z",
  isSelected: true,
  isEditing: false,
  isModified: false,
  originalQuestion: "What is Astro?",
  originalAnswer: "Astro is a web framework",
  ...overrides,
});

describe("ProposalCard", () => {
  it("renders question and answer counters", () => {
    const proposal = createProposal();

    render(<ProposalCard proposal={proposal} onToggle={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText("Question")).toBeInTheDocument();
    expect(screen.getByText("Answer")).toBeInTheDocument();
    expect(screen.getByText(/14\s*\/\s*500/)).toBeInTheDocument();
    expect(screen.getByText(/24\s*\/\s*2000/)).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("invokes onToggle when checkbox button is clicked", () => {
    const proposal = createProposal();
    const onToggle = vi.fn();

    render(<ProposalCard proposal={proposal} onToggle={onToggle} onEdit={vi.fn()} />);

    const toggleButton = screen.getByRole("button", {
      name: /select flashcard/i,
    });

    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalledWith(proposal.id);
  });

  it("toggles editing mode when edit button is clicked", () => {
    const proposal = createProposal();

    render(<ProposalCard proposal={proposal} onToggle={vi.fn()} onEdit={vi.fn()} />);

    const editButton = screen.getByRole("button", { name: /edit flashcard/i });

    fireEvent.click(editButton);

    expect(screen.getByRole("textbox", { name: /question/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /answer/i })).toBeInTheDocument();
  });

  it("calls onEdit when typing in question textarea", () => {
    const proposal = createProposal();
    const onEdit = vi.fn();

    render(<ProposalCard proposal={proposal} onToggle={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: /edit flashcard/i }));

    const questionTextarea = screen.getByRole("textbox", { name: /question/i });
    fireEvent.change(questionTextarea, { target: { value: "New question" } });

    expect(onEdit).toHaveBeenCalledWith(proposal.id, "question", "New question");
  });

  it("shows validation errors for invalid question and answer", () => {
    const proposal = createProposal({
      question: "hi",
      answer: "yo",
    });

    render(<ProposalCard proposal={proposal} onToggle={vi.fn()} onEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /edit flashcard/i }));

    expect(screen.getByText(/Question must be at least/)).toBeInTheDocument();
    expect(screen.getByText(/Answer must be at least/)).toBeInTheDocument();
  });

  it("renders in read-only mode when proposal is not selected", () => {
    const proposal = createProposal({ isSelected: false });

    render(<ProposalCard proposal={proposal} onToggle={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /edit flashcard/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select flashcard/i })).toHaveAttribute("aria-pressed", "false");
  });
});
