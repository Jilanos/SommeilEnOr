import catalog from "./i18n/fr.json";

type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof catalog>;

/** French message at a dotted catalog path. */
export function message(key: MessageKey): string {
  let node: unknown = catalog;
  for (const segment of key.split(".")) node = (node as Record<string, unknown>)[segment];
  return typeof node === "string" ? node : key;
}

/** Look up a French message; `{name}` placeholders are replaced from `params`. */
export function t(key: MessageKey, params: Record<string, string | number> = {}): string {
  return message(key).replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}
