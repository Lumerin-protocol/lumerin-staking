export function createArray<T>(length: number, cb: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => cb(i));
}
