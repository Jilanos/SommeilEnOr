import { useCallback, useRef, useState } from "react";
import { ApiError, DisconnectedError } from "./api";
import { t } from "./i18n";

export type SaveState =
  "idle" | "pending" | "saved" | "failed" | "disconnected";

export interface Saver {
  state: SaveState;
  message: string;
  run: <T>(action: () => Promise<T>) => Promise<T | undefined>;
}

export function errorMessage(error: unknown): string {
  if (error instanceof DisconnectedError) return t("save.disconnected");
  if (error instanceof ApiError) {
    if (error.status === 401) return t("error.session");
    return error.message || t("error.generic");
  }
  return t("error.generic");
}

/** Runs one server write and exposes a truthful pending/saved/failed/disconnected state. */
export function useSaver(): Saver {
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef(0);
  const failure = useRef<unknown>(null);

  const run = useCallback(async <T>(action: () => Promise<T>) => {
    if (pending.current === 0) failure.current = null;
    pending.current += 1;
    setState("pending");
    setMessage("");
    // Reject an offline tap immediately, even while an earlier online write is pending.
    // This serialization only orders current writes; it never replays offline intent.
    const offline = navigator.onLine === false;
    const operation = offline
      ? Promise.reject<T>(new DisconnectedError("offline"))
      : queue.current.then(action);
    if (!offline) queue.current = operation.catch(() => undefined);
    try {
      return await operation;
    } catch (error) {
      failure.current = error;
      return undefined;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) {
        if (failure.current) {
          setState(
            failure.current instanceof DisconnectedError
              ? "disconnected"
              : "failed",
          );
          setMessage(errorMessage(failure.current));
        } else setState("saved");
      }
    }
  }, []);

  return { state, message, run };
}
