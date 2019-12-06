declare class ThinkStoreFile {
  constructor(options: object, ctx: object, cookieOptions?: object)
  autoUpdate(): void
  get(name: string): Promise<any>
  set(name: string, value): Promise<any>
  delete(): Promise<any>
  flush(): Promise<any>
  gc(): void
}

export = ThinkStoreFile;