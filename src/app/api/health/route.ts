import { getServerEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export function GET() {
  const environment = getServerEnvironment();
  const logger = createLogger({ minimumLevel: environment.LOG_LEVEL });

  logger.debug("health_check_completed", { status: "ok" });

  return Response.json(
    {
      status: "ok",
      service: "pipupath-web",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
