export type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, string | number | boolean | null | undefined>;

const levels: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const blockedContextKeys =
  /password|secret|token|authorization|cookie|email|phone/i;

export type LoggerSink = (entry: Record<string, unknown>) => void;

export function createLogger({
  minimumLevel = "info",
  sink = (entry) => console.log(JSON.stringify(entry)),
}: {
  minimumLevel?: LogLevel | "silent";
  sink?: LoggerSink;
} = {}) {
  function write(level: LogLevel, event: string, context: LogContext = {}) {
    if (
      minimumLevel === "silent" ||
      levels[level] < levels[minimumLevel as LogLevel]
    ) {
      return;
    }

    const safeContext = Object.fromEntries(
      Object.entries(context).filter(([key]) => !blockedContextKeys.test(key)),
    );

    sink({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...safeContext,
    });
  }

  return {
    debug: (event: string, context?: LogContext) =>
      write("debug", event, context),
    info: (event: string, context?: LogContext) =>
      write("info", event, context),
    warn: (event: string, context?: LogContext) =>
      write("warn", event, context),
    error: (event: string, context?: LogContext) =>
      write("error", event, context),
  };
}
Ÿ®8