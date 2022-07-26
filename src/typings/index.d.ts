/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'reuse-promise' {
  type AsyncFn = (...args: any[]) => Promise<any>
  export default function reusePromise<T extends AsyncFn>(fn: T, options?: { memoize?: boolean }): T
}
