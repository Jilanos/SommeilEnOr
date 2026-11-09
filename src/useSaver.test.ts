import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useSaver } from "./useSaver";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
}
it("serializes simultaneous writes and stays pending until all finish", async () => {
  setOnline(true);
  const { result } = renderHook(useSaver);
  let resolveFirst!: () => void;
  let resolveSecond!: () => void;
  const first = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveFirst = resolve;
      }),
  );
  const second = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveSecond = resolve;
      }),
  );
  let firstRun!: Promise<unknown>;
  let secondRun!: Promise<unknown>;
  act(() => {
    firstRun = result.current.run(first);
    secondRun = result.current.run(second);
  });
  await waitFor(() => expect(first).toHaveBeenCalledOnce());
  expect(second).not.toHaveBeenCalled();
  expect(result.current.state).toBe("pending");
  await act(async () => {
    resolveFirst();
    await firstRun;
  });
  await waitFor(() => expect(second).toHaveBeenCalledOnce());
  expect(result.current.state).toBe("pending");
  await act(async () => {
    resolveSecond();
    await secondRun;
  });
  expect(result.current.state).toBe("saved");
});
it("does not hide a failure behind a later successful write in the same batch", async () => {
  setOnline(true);
  const { result } = renderHook(useSaver);
  await act(async () => {
    await Promise.all([
      result.current.run(async () => {
        throw new Error("failed");
      }),
      result.current.run(async () => true),
    ]);
  });
  expect(result.current.state).toBe("failed");
  await act(async () => {
    await result.current.run(async () => true);
  });
  expect(result.current.state).toBe("saved");
});
it("rejects an offline tap while another write is pending, with no replay on reconnect", async () => {
  setOnline(true);
  const { result } = renderHook(useSaver);
  let finish!: () => void;
  let pending!: Promise<unknown>;
  act(() => {
    pending = result.current.run(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
  });
  await waitFor(() => expect(finish).toBeTruthy());
  const offlineWrite = vi.fn(async () => true);
  setOnline(false);
  await act(async () => {
    await result.current.run(offlineWrite);
  });
  setOnline(true);
  await act(async () => {
    finish();
    await pending;
  });
  expect(offlineWrite).not.toHaveBeenCalled();
  expect(result.current.state).toBe("disconnected");
});
