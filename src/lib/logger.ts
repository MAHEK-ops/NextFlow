type LogLevel = "info" | "warn" | "error" | "debug";

function createLogger() {
  if (process.env.NODE_ENV === "production") {
    return {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
      debug: () => undefined,
    };
  }

  function log(level: LogLevel, message: string, data?: unknown) {
    const prefix = `[nextflow:${level}]`;
    if (data !== undefined) {
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](prefix, message, data);
    } else {
      // eslint-disable-next-line no-console
      console[level === "debug" ? "log" : level](prefix, message);
    }
  }

  return {
    info: (message: string, data?: unknown) => log("info", message, data),
    warn: (message: string, data?: unknown) => log("warn", message, data),
    error: (message: string, data?: unknown) => log("error", message, data),
    debug: (message: string, data?: unknown) => log("debug", message, data),
  };
}

export const logger = createLogger();
