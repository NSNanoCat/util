export declare class Storage {
  static data: Record<string, any>;
  static dataFile: string;
  static getItem<T = any>(keyName: string, defaultValue?: T): T;
  static setItem(keyName: string, value: any): boolean;
  static removeItem(keyName: string): boolean;
  static clear(): boolean;
}
