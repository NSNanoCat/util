export declare class URLSearchParams {
    #private;
    constructor(params?: string | Iterable<[string, string]> | object);
    append(name: string, value: string): void;
    delete(name: string, value?: string): void;
    entries(): Array<[string, string]>;
    get(name: string): string | undefined;
    getAll(name: string): Array<string>;
    has(name: string, value?: string): boolean;
    keys(): Array<string>;
    set(name: string, value: string): void;
    sort(): void;
    toString: () => string;
    values: () => Iterator<string>;
}
//# sourceMappingURL=URLSearchParams.d.mts.map