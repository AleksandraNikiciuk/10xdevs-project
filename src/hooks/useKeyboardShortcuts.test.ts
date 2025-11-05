import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const dispatchKeydown = (options: KeyboardEventInit & { key: string }) => {
  const event = new KeyboardEvent("keydown", options);
  const preventDefaultSpy = vi.spyOn(event, "preventDefault");

  act(() => {
    window.dispatchEvent(event);
  });

  return { event, preventDefaultSpy };
};

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invokes shortcut handler when key and modifiers match", () => {
    const handler = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "s",
          ctrlOrCmd: true,
          handler,
        },
      ])
    );

    const { preventDefaultSpy } = dispatchKeydown({ key: "s", ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("ignores shortcuts when disabled", () => {
    const handler = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "s",
          ctrlOrCmd: true,
          handler,
          disabled: true,
        },
      ])
    );

    const { preventDefaultSpy } = dispatchKeydown({ key: "s", ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("requires shift modifier when configured", () => {
    const handler = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "k",
          shift: true,
          handler,
        },
      ])
    );

    dispatchKeydown({ key: "k" });
    expect(handler).not.toHaveBeenCalled();

    dispatchKeydown({ key: "k", shiftKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("stops matching after the first shortcut triggers", () => {
    const primaryHandler = vi.fn();
    const secondaryHandler = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        { key: "s", ctrlOrCmd: true, handler: primaryHandler },
        { key: "s", ctrlOrCmd: true, handler: secondaryHandler },
      ])
    );

    dispatchKeydown({ key: "s", ctrlKey: true });

    expect(primaryHandler).toHaveBeenCalledTimes(1);
    expect(secondaryHandler).not.toHaveBeenCalled();
  });

  it("cleans up the keydown listener on unmount", () => {
    const addListenerSpy = vi.spyOn(window, "addEventListener");
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([
        {
          key: "s",
          handler: vi.fn(),
        },
      ])
    );

    expect(addListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    const handlerRef = addListenerSpy.mock.calls[0]?.[1] as EventListener | undefined;

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith("keydown", handlerRef);
  });
});
