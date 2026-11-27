import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SudoCancelledError } from "@core/store/useSudoStore";
import { useConfirmedAction } from "../use-confirmed-action";

describe("useConfirmedAction", () => {
  it("opens, executes action, closes dialog, and calls onSuccess", async () => {
    const { result } = renderHook(() => useConfirmedAction());
    const action = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    act(() => {
      result.current.requestConfirmation(action, {
        title: "Resend Setup Email",
        description: "Resend account setup email to Remon?",
        variant: "default",
        confirmButtonText: "Send",
        onSuccess,
      });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.options.title).toBe("Resend Setup Email");

    await act(async () => {
      await result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it("closes dialog and invokes onError when action rejects with a regular error", async () => {
    const { result } = renderHook(() => useConfirmedAction());
    const err = new Error("Cooldown active");
    const action = vi.fn().mockRejectedValue(err);
    const onError = vi.fn();

    act(() => {
      result.current.requestConfirmation(action, {
        title: "Resend Setup Email",
        onError,
      });
    });

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("preserves dialog and pending action for retry on SudoCancelledError", async () => {
    const { result } = renderHook(() => useConfirmedAction());
    const sudoErr = new SudoCancelledError("Sudo verification cancelled");
    const action = vi.fn().mockRejectedValueOnce(sudoErr).mockResolvedValueOnce(undefined);
    const onError = vi.fn();
    const onSuccess = vi.fn();

    act(() => {
      result.current.requestConfirmation(action, {
        title: "Transfer Protection",
        onError,
        onSuccess,
      });
    });

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.options.title).toBe("Transfer Protection");
    expect(onError).toHaveBeenCalledWith(sudoErr);

    await act(async () => {
      await result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
  });

  it("does not clobber a newly opened confirmation when outer action schedules another", async () => {
    const { result } = renderHook(() => useConfirmedAction());
    const secondAction = vi.fn().mockResolvedValue(undefined);
    const firstAction = vi.fn().mockImplementation(async () => {
      result.current.requestConfirmation(secondAction, {
        title: "Follow-up Confirmation",
      });
    });

    act(() => {
      result.current.requestConfirmation(firstAction, { title: "First Confirmation" });
    });

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.options.title).toBe("Follow-up Confirmation");

    await act(async () => {
      await result.current.execute();
    });

    expect(secondAction).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
  });
});
