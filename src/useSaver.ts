import { useCallback, useRef, useState } from "react";
import { ApiError, DisconnectedError } from "./api";
import { t } from "./i18n";

export type SaveState = "idle" | "pending" | "saved" | "failed" | "disconnected";

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
  const counter = useRef(0);

  const run = useCallback(async <T,>(action: () => Promise<T>) => {
    const id = ++counter.current;
    setState("pending");
    setMessage("");
    try {
      const result = await action();
      if (id === counter.current) setState("saved");
      return result;
    } catch (error) {
      if (id === counter.current) {
        setState(error instanceof DisconnectedError ? "disconnected" : "failed");
        setMessage(errorMessage(error));
      }
      return undefined;
    }
  }, []);

  return { state, message, run };
}
