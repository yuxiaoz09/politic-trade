declare module 'unzipper' {
  import { Writable, Transform } from 'stream'

  interface Entry extends NodeJS.ReadableStream {
    path: string
    type: string
    autodrain(): void
  }

  interface ParseStream extends Writable {
    on(event: 'entry', listener: (entry: Entry) => void): this
    on(event: 'finish', listener: () => void): this
    on(event: 'error', listener: (err: Error) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
  }

  export function Parse(opts?: object): ParseStream
}
