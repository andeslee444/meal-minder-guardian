/// <reference lib="deno.window" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
}
