import { describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger";

describe("createLogger", () => {
  it("writes structured events at or above the minimum level", () => {
    const sink = vi.fn();
    const logger = createLogger({ minimumLevel: "info", sink });

    logger.debug("ignored");
    logger.info("stage_completed", { stage: 1, valid: true });

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        event: "stage_completed",
        stage: 1,
        valid: true,
        timestamp: expect.any(String),
      }),
    );
  });

  it("removes sensitive context fields", () => {
    const sink = vi.fn();
    const logger = createLogger({ sink });

    logger.warn("unsafe_context_received", {
      userId: "safe-id",
      email: "private@example.com",
      accessToken: "secret",
      cookie: "session",
    });

    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "safe-id",
        level: "warn",
      }),
    );
    const entry = sink.mock.calls[0][0];
    expect(entry).not.toHaveProperty("email");
    expect(entry).not.toHaveProperty("accessToken");
    expect(entry).not.toHaveProperty("cookie");
  });

  it("supports silent operation", () => {
    const sink = vi.fn();
    const logger = createLogger({ minimumLevel: "silent", sink });

    logger.error("not_written");

    expect(sink).not.toHaveBeenCalled();
  });

  it("exposes each severity method", () => {
    const sink = vi.fn();
    const logger = createLogger({ minimumLevel: "debug", sink });

    logger.debug("debug_event");
    logger.info("info_event");
    logger.warn("warn_event");
    logger.error("error_event");

    expect(sink).toHaveBeenCalledTimes(4);
  });
});
