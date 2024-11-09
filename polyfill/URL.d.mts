export declare class URL {
    #private;
    constructor(url: string, base?: string);
    get hash(): string;
    set hash(value: string);
    get host(): string;
    set host(value: string);
    get hostname(): string;
    set hostname(value: string);
    get href(): string;
    set href(value: string);
    get origin(): string;
    get password(): string;
    set password(value: string);
    get pathname(): string;
    set pathname(value: string);
    get port(): string;
    set port(value: string);
    get protocol(): string;
    set protocol(value: string);
    get search(): string;
    set search(value: string);
    get searchParams(): any;
    get username(): string;
    set username(value: string);
    /**
     * Returns the string representation of the URL.
     *
     * @returns {string} The href of the URL.
     */
    toString: () => string;
    /**
     * Converts the URL object properties to a JSON string.
     *
     * @returns {string} A JSON string representation of the URL object.
     */
    toJSON: () => string;
}
//# sourceMappingURL=URL.d.mts.map