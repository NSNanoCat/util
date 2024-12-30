import { $app } from "../lib/app";

class ConsoleFactory {
  #counts = new Map<string, number>([]);
  #groups: string[] = [];
  #times = new Map<string, number>([]);

  clear = () => { };

  count = (label = "default") => {
    if (this.#counts.has(label)) {
      this.#counts.set(label, this.#counts.get(label) ?? 0 + 1);
    } else {
      this.#counts.set(label, 0);
    }
    this.log(`${label}: ${this.#counts.get(label)}`);
  };

  countReset = (label = "default") => {
    switch (this.#counts.has(label)) {
      case true:
        this.#counts.set(label, 0);
        this.log(`${label}: ${this.#counts.get(label)}`);
        break;
      case false:
        this.warn(`Counter "${label}" doesn’t exist`);
        break;
    }
  };

  debug = (...args: any[]) => {
    if (this.#level < 4) return;
    this.log(...args.map((m) => `🅱️ ${m}`));
  };

  error(...msg: any[]) {
    if (this.#level < 1) return;
    switch ($app) {
      case "Surge":
      case "Loon":
      case "Stash":
      case "Egern":
      case "Shadowrocket":
      case "Quantumult X":
      case "Node.js":
        this.log(...msg.map((m) => {
          if (m instanceof Error) {
            return `❌ ${m.stack}`
          }
          return `❌ ${m}`
        }));
        break;
      default:
        this.log(...msg.map((m) => `❌ ${m}`));
        break;
    }
  }

  exception = (...msg: any[]) => this.error(...msg);

  group = (label: string) => this.#groups.unshift(label);

  groupEnd = () => this.#groups.shift();

  info(...msg: any[]) {
    if (this.#level < 3) return;
    this.log(...msg.map((m) => `ℹ️ ${m}`));
  }

  #level = 3;

  get logLevel() {
    switch (this.#level) {
      case 0:
        return "OFF";
      case 1:
        return "ERROR";
      case 2:
        return "WARN";
      case 4:
        return "DEBUG";
      case 5:
        return "ALL";
      case 3:
      default:
        return "INFO";
    }
  }

  set logLevel(_level: string | number) {
    let level = _level;
    switch (typeof level) {
      case "string":
        level = level.toLowerCase();
        break;
      case "number":
        break;
      case "undefined":
      default:
        level = "warn";
        break;
    }
    switch (level) {
      case 0:
      case "off":
        this.#level = 0;
        break;
      case 1:
      case "error":
        this.#level = 1;
        break;
      case 3:
      case "info":
        this.#level = 3;
        break;
      case 4:
      case "debug":
        this.#level = 4;
        break;
      case 5:
      case "all":
        this.#level = 5;
        break;
      case 2:
      case "warn":
      case "warning":
      default:
        this.#level = 2;
        break;
    }
  }

  log = (...args: any[]) => {
    if (this.#level === 0) return;
    let msg = args
    msg = msg.map((item) => {
      let log = item;
      switch (typeof log) {
        case "object":
          log = JSON.stringify(log);
          break;
        case "bigint":
        case "number":
        case "boolean":
        case "string":
          log = log.toString();
          break;
        case "undefined":
        default:
          break;
      }
      return log;
    });
    this.#groups.forEach((group) => {
      msg = msg.map((log) => `  ${log}`);
      msg.unshift(`▼ ${group}:`);
    });
    msg = ["", ...msg];
    console.log(msg.join("\n"));
  };

  time = (label = "default") => this.#times.set(label, Date.now());

  timeEnd = (label = "default") => this.#times.delete(label);

  timeLog = (label = "default") => {
    const time = this.#times.get(label);
    if (time) {
      this.log(`${label}: ${Date.now() - time}ms`);
    } else {
      this.warn(`Timer "${label}" doesn’t exist`);
    }
  };

  warn(...args: any[]) {
    if (this.#level < 2) {
      return;
    }
    let msg = args;
    msg = msg.map((m) => `⚠️ ${m}`);
    this.log(...msg);
  }
}


export const Console = new ConsoleFactory();